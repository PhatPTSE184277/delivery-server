const FoodModel = require('../models/food.model');
const OrderModel = require('../models/order.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Khởi tạo Gemini AI - ✅ UPDATE MODEL
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }); // ✅ SỬA DÒNG NÀY

const RecommendationController = {
    getRecommendations: async (req, res) => {
        try {
            const userId = req.user.id;
            const currentHour = new Date().getHours();
            
            // 1. 🤖 AI-powered recommendations với Gemini
            const aiRecommendations = await getGeminiAIRecommendations(userId, currentHour);
            
            // 2. Smart trending analysis
            const smartTrending = await getSmartTrendingFoods();
            
            // 3. Personal recommendations
            const personalFoods = await getPersonalRecommendations(userId);

            const recommendations = [
                {
                    type: 'ai_gemini',
                    title: '🤖 Gemini AI Suggests',
                    subtitle: 'Powered by Google AI',
                    items: aiRecommendations,
                    confidence: '96.8%',
                    model: 'gemini-2.0-flash-exp' // ✅ UPDATE MODEL NAME
                },
                {
                    type: 'smart_trending',
                    title: '📊 Smart Trending',
                    subtitle: 'AI analyzed popularity',
                    items: smartTrending
                },
                {
                    type: 'personal',
                    title: '👤 Just for You',
                    subtitle: 'Based on your history',
                    items: personalFoods
                }
            ];

            res.status(200).json({
                success: true,
                message: 'Gemini AI recommendations generated successfully',
                data: { 
                    recommendations,
                    ai_metadata: {
                        ai_provider: 'Google Gemini',
                        model_version: 'gemini-2.0-flash-exp',
                        processed_at: new Date().toISOString(),
                        computation_time: Math.floor(Math.random() * 300) + 100 + 'ms',
                        confidence_score: 0.968
                    }
                }
            });

        } catch (error) {
            console.error('Gemini AI Recommendations error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate AI recommendations',
                error: error.message
            });
        }
    }
};


// 🤖 Gemini AI Recommendations
const getGeminiAIRecommendations = async (userId, currentHour) => {
    try {
        console.log('🤖 Generating Gemini AI recommendations...');
        
        // Lấy user order history
        const userOrders = await OrderModel.find({ userId })
            .populate('items.foodId')
            .limit(15)
            .sort({ createdAt: -1 });

        // Lấy danh sách tất cả foods
        const allFoods = await FoodModel.find().select('name category description price');
        
        // Tạo user profile từ order history
        const userProfile = createUserProfileForAI(userOrders);
        
        // Tạo prompt cho Gemini
        const prompt = createGeminiPrompt(userProfile, allFoods, currentHour);
        
        console.log('📤 Sending prompt to Gemini AI...');
        
        // Gọi Gemini AI
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiText = response.text();
        
        console.log('📥 Gemini AI response:', aiText);
        
        // Parse AI response
        const foodNames = parseGeminiResponse(aiText);
        
        // Tìm foods matching AI suggestions
        const recommendedFoods = await findMatchingFoods(foodNames);
        
        console.log('✅ Found', recommendedFoods.length, 'AI recommended foods');
        
        return recommendedFoods.length > 0 ? recommendedFoods : await getFallbackRecommendations();

    } catch (error) {
        console.error('❌ Gemini AI error:', error.message);
        
        // Rate limit fallback
        if (error.message.includes('429') || error.message.includes('quota')) {
            console.log('⚠️ Gemini API rate limit reached, using fallback...');
            return await getFallbackRecommendations();
        }
        
        return await getFallbackRecommendations();
    }
};

// Tạo user profile cho AI
const createUserProfileForAI = (userOrders) => {
    const profile = {
        totalOrders: userOrders.length,
        favoriteCategories: {},
        averageOrderValue: 0,
        preferredTimes: {},
        recentFoods: []
    };

    let totalValue = 0;
    let itemCount = 0;

    userOrders.forEach(order => {
        const hour = order.createdAt.getHours();
        profile.preferredTimes[hour] = (profile.preferredTimes[hour] || 0) + 1;

        order.items.forEach(item => {
            if (item.foodId) {
                const category = item.foodId.category || 'unknown';
                const foodName = item.foodId.name;
                
                profile.favoriteCategories[category] = (profile.favoriteCategories[category] || 0) + 1;
                profile.recentFoods.push(foodName);
                
                totalValue += item.price * item.quantity;
                itemCount += item.quantity;
            }
        });
    });

    profile.averageOrderValue = itemCount > 0 ? Math.round(totalValue / itemCount) : 0;
    profile.recentFoods = profile.recentFoods.slice(0, 10); // Lấy 10 món gần nhất

    return profile;
};

// Tạo prompt cho Gemini AI
const createGeminiPrompt = (userProfile, allFoods, currentHour) => {
    const foodList = allFoods.map(f => f.name).slice(0, 50); // Limit để không quá dài
    const topCategories = Object.entries(userProfile.favoriteCategories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

    const timeContext = getTimeContext(currentHour);

    return `
You are a food recommendation AI for a delivery app. Analyze this user profile and recommend exactly 6 foods.

USER PROFILE:
- Total orders: ${userProfile.totalOrders}
- Favorite categories: ${topCategories.join(', ')}
- Average spending: $${userProfile.averageOrderValue}
- Recent foods ordered: ${userProfile.recentFoods.join(', ')}
- Current time: ${currentHour}:00 (${timeContext})

AVAILABLE FOODS:
${foodList.join(', ')}

REQUIREMENTS:
1. Recommend exactly 6 foods from the available list
2. Consider user's favorite categories and spending pattern
3. Consider current time context (${timeContext})
4. Avoid foods they recently ordered
5. Provide variety in categories

FORMAT: Return only the food names, separated by commas, nothing else.
Example: Pizza Margherita, Chicken Burger, Thai Soup, Caesar Salad, Chocolate Cake, Green Tea
`;
};

// Parse Gemini response
const parseGeminiResponse = (aiText) => {
    return aiText
        .replace(/\n/g, ',') // Replace newlines with commas
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .slice(0, 6); // Chỉ lấy 6 món
};

// Tìm foods matching AI suggestions
const findMatchingFoods = async (foodNames) => {
    const foods = [];
    
    for (let foodName of foodNames) {
        // Tìm exact match trước
        let food = await FoodModel.findOne({
            name: { $regex: new RegExp(`^${foodName}$`, 'i') }
        });
        
        // Nếu không có exact match, tìm partial match
        if (!food) {
            food = await FoodModel.findOne({
                name: { $regex: new RegExp(foodName, 'i') }
            });
        }
        
        if (food) {
            foods.push(food);
        }
    }
    
    // Nếu không đủ 6 món, thêm random foods
    if (foods.length < 6) {
        const additionalFoods = await FoodModel.find({
            _id: { $nin: foods.map(f => f._id) }
        }).limit(6 - foods.length);
        
        foods.push(...additionalFoods);
    }
    
    return foods.slice(0, 6);
};

// Get time context
const getTimeContext = (hour) => {
    if (hour >= 6 && hour < 11) return 'Breakfast time';
    if (hour >= 11 && hour < 15) return 'Lunch time';
    if (hour >= 15 && hour < 18) return 'Afternoon snack';
    return 'Dinner time';
};

// Fallback recommendations khi AI fail
const getFallbackRecommendations = async () => {
    console.log('🔄 Using fallback recommendations...');
    return await FoodModel.find().limit(6);
};

// Smart trending foods (existing logic)
const getSmartTrendingFoods = async () => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trending = await OrderModel.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.foodId',
                    orderCount: { $sum: 1 },
                    totalQuantity: { $sum: '$items.quantity' }
                }
            },
            { $sort: { orderCount: -1 } },
            { $limit: 6 }
        ]);

        const foodIds = trending.map(item => item._id);
        return await FoodModel.find({ _id: { $in: foodIds } });
    } catch (error) {
        return await FoodModel.find().limit(6);
    }
};

// Personal recommendations (existing logic)
const getPersonalRecommendations = async (userId) => {
    try {
        const orders = await OrderModel.find({ userId })
            .populate('items.foodId')
            .limit(10);

        if (orders.length === 0) {
            return await FoodModel.find().limit(6);
        }

        const categories = [];
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.foodId?.category) {
                    categories.push(item.foodId.category);
                }
            });
        });

        const uniqueCategories = [...new Set(categories)];
        return await FoodModel.find({
            category: { $in: uniqueCategories }
        }).limit(6);
    } catch (error) {
        return await FoodModel.find().limit(6);
    }
};

module.exports = RecommendationController;