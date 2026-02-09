// lib/gemini/promptEnhancer.ts

interface EnhancedPrompt {
    original: string;
    enhanced: string;
    wasEnhanced: boolean;
    method?: 'pattern' | 'ai' | 'none';
}

export async function enhancePrompt(userPrompt: string): Promise<EnhancedPrompt> {
    const lowerPrompt = userPrompt.toLowerCase().trim();

    // STEP 1: Try pattern matching first (instant, 0ms)
    const patternResult = tryPatternMatching(lowerPrompt, userPrompt);
    if (patternResult) {
        console.log("🔧 Enhanced using pattern matching (0ms)");
        return patternResult;
    }

    // STEP 2: Check if prompt is already good
    if (isGoodPrompt(userPrompt)) {
        console.log("✅ Prompt is already clear, no enhancement needed");
        return {
            original: userPrompt,
            enhanced: userPrompt,
            wasEnhanced: false,
            method: 'none',
        };
    }

    // STEP 3: Fallback to AI enhancement for unknown patterns
    console.log("🤖 Using AI enhancement for unknown pattern (+1-2s)");
    return await aiEnhancePrompt(userPrompt);
}

// ==========================================
// PATTERN MATCHING (Fast Path)
// ==========================================

function tryPatternMatching(lowerPrompt: string, originalPrompt: string): EnhancedPrompt | null {
    const patterns = [
        // E-commerce Products
        {
            matches: (p: string) =>
                (p.includes('product') || p.includes('amazon') || p.includes('ecommerce') || p.includes('shop')) &&
                !p.match(/\d+/),
            enhance: () =>
                `Generate a JSON array of 5 products. Each product should have: id (string), name (string), brand (string), price (number), currency (string, "USD"), category (string), rating (number, 0-5), reviewsCount (number), imageUrl (string), description (string), availability (string, "In Stock" or "Out of Stock"), and primeEligible (boolean).`
        },

        // Users/Profiles
        {
            matches: (p: string) =>
                (p.includes('user') || p.includes('profile') || p.includes('account') || p.includes('member')) &&
                !p.includes('should have'),
            enhance: () =>
                `Generate a JSON array of 3 user profiles. Each user should have: id (number), name (string), email (string), age (number), country (string), registrationDate (string, ISO format), isPremium (boolean), lastLogin (string, ISO format), and avatar (string, URL).`
        },

        // Countries/Geography
        {
            matches: (p: string) =>
                (p.includes('countr') || p.includes('nation') || p.includes('geo')) &&
                !p.includes('fields'),
            enhance: () =>
                `Generate a JSON array of 5 countries. Each country should have: name (string), capital (string), population (number), continent (string), currency (string), languages (array of strings), and flagUrl (string).`
        },

        // Restaurants/Food/Menu
        {
            matches: (p: string) =>
                (p.includes('restaurant') || p.includes('menu') || p.includes('food') || p.includes('dish') || p.includes('recipe')) &&
                !p.match(/\d+/),
            enhance: () =>
                `Generate a JSON array of 5 menu items. Each item should have: id (string), name (string), description (string), price (number), currency (string, "USD"), category (string), isVegetarian (boolean), isVegan (boolean), calories (number), ingredients (array of strings), allergens (array of strings), and rating (number, 0-5).`
        },

        // Employees/Staff/Team
        {
            matches: (p: string) =>
                (p.includes('employee') || p.includes('staff') || p.includes('worker') || p.includes('team member')) &&
                !p.includes('fields'),
            enhance: () =>
                `Generate a JSON array of 3 employees. Each employee should have: id (number), name (string), email (string), position (string), department (string), salary (number), hireDate (string, ISO format), isActive (boolean), and skills (array of strings).`
        },

        // Tasks/Todos/Checklists
        {
            matches: (p: string) =>
                (p.includes('todo') || p.includes('task') || p.includes('checklist') || p.includes('item')) &&
                !p.match(/\d+/),
            enhance: () =>
                `Generate a JSON array of 5 tasks. Each task should have: id (number), title (string), description (string), priority (string, "high", "medium", or "low"), status (string, "pending", "in-progress", or "completed"), dueDate (string, ISO format), assignee (string), and tags (array of strings).`
        },

        // Books
        {
            matches: (p: string) =>
                p.includes('book') && !p.includes('fields'),
            enhance: () =>
                `Generate a JSON array of 5 books. Each book should have: title (string), author (string), year (number), genre (string), pages (number), isbn (string), rating (number, 0-5), description (string), and publisher (string).`
        },

        // Movies/Films
        {
            matches: (p: string) =>
                (p.includes('movie') || p.includes('film') || p.includes('cinema')) &&
                !p.includes('fields'),
            enhance: () =>
                `Generate a JSON array of 5 movies. Each movie should have: title (string), year (number), director (string), genre (string), rating (number, 0-10), duration (number, in minutes), cast (array of strings), and description (string).`
        },

        // Cars/Vehicles
        {
            matches: (p: string) =>
                (p.includes('car') || p.includes('vehicle') || p.includes('auto')) &&
                !p.match(/\d+/),
            enhance: () =>
                `Generate a JSON array of 5 cars. Each car should have: make (string), model (string), year (number), price (number), fuelType (string), transmission (string), mileage (number), color (string), and features (array of strings).`
        },

        // Events/Conferences
        {
            matches: (p: string) =>
                (p.includes('event') || p.includes('conference') || p.includes('meetup') || p.includes('seminar')) &&
                !p.match(/\d+/),
            enhance: () =>
                `Generate a JSON array of 5 events. Each event should have: id (string), title (string), description (string), date (string, ISO format), time (string), location (string), organizer (string), capacity (number), ticketPrice (number), and category (string).`
        },

        // Stocks/Finance
        {
            matches: (p: string) =>
                (p.includes('stock') || p.includes('share') || p.includes('finance') || p.includes('ticker')) &&
                !p.match(/\d+/),
            enhance: () =>
                `Generate a JSON array of 5 stocks. Each stock should have: symbol (string), company (string), currentPrice (number), change (number), changePercent (number), volume (number), marketCap (number), and sector (string).`
        },

        // Programming Languages
        {
            matches: (p: string) =>
                (p.includes('programming') || p.includes('language') || p.includes('code')) &&
                !p.includes('fields'),
            enhance: () =>
                `Generate a JSON array of 5 programming languages. Each language should have: name (string), yearCreated (number), paradigm (string), popularityRank (number), and mainUseCase (string).`
        },

        // Songs/Music
        {
            matches: (p: string) =>
                (p.includes('song') || p.includes('music') || p.includes('track') || p.includes('album')) &&
                !p.match(/\d+/),
            enhance: () =>
                `Generate a JSON array of 5 songs. Each song should have: title (string), artist (string), album (string), year (number), genre (string), duration (number, in seconds), and rating (number, 0-5).`
        },

        // Courses/Classes
        {
            matches: (p: string) =>
                (p.includes('course') || p.includes('class') || p.includes('lesson') || p.includes('tutorial')) &&
                !p.match(/\d+/),
            enhance: () =>
                `Generate a JSON array of 5 courses. Each course should have: id (string), title (string), instructor (string), description (string), duration (number, in hours), price (number), rating (number, 0-5), level (string, "beginner", "intermediate", or "advanced"), and enrolledStudents (number).`
        },
    ];

    for (const pattern of patterns) {
        if (pattern.matches(lowerPrompt)) {
            return {
                original: originalPrompt,
                enhanced: pattern.enhance(),
                wasEnhanced: true,
                method: 'pattern',
            };
        }
    }

    return null; // No pattern matched
}

// ==========================================
// CHECK IF PROMPT IS ALREADY GOOD
// ==========================================

function isGoodPrompt(prompt: string): boolean {
    const indicators = [
        prompt.length > 50, // Detailed
        prompt.match(/\d+/), // Has item count
        prompt.includes('should have'),
        prompt.includes('fields:'),
        prompt.includes('each') && prompt.includes('with'),
        prompt.split(',').length > 3, // Lists multiple fields
    ];

    // Prompt is good if 2+ indicators are true
    const trueCount = indicators.filter(Boolean).length;
    return trueCount >= 2;
}

// ==========================================
// AI ENHANCEMENT (Fallback)
// ==========================================

async function aiEnhancePrompt(userPrompt: string): Promise<EnhancedPrompt> {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `You are a prompt enhancement AI. Convert vague user requests into clear, structured JSON generation prompts.

User's request: "${userPrompt}"

Create a clear prompt that:
1. Specifies it should return a JSON array
2. Limits to 5-10 items if it's a list
3. Defines exact field names with data types
4. Adds relevant fields the user might want
5. Specifies realistic data requirements

Return ONLY the enhanced prompt text, no explanations.

Example:
Input: "make some data"
Output: "Generate a JSON array of 5 generic items. Each item should have: id (number), name (string), description (string), value (number), and category (string)."

Now enhance: "${userPrompt}"`
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 400,
                    }
                }),
            }
        );

        if (!response.ok) {
            console.error("❌ AI enhancement failed, using generic fallback");
            return {
                original: userPrompt,
                enhanced: `${userPrompt}. Return a JSON array with 5-10 items. Include relevant fields with appropriate data types. Ensure all data is realistic and complete.`,
                wasEnhanced: true,
                method: 'ai',
            };
        }

        const data = await response.json();
        const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!enhanced || enhanced === userPrompt) {
            // AI didn't improve it
            return {
                original: userPrompt,
                enhanced: `${userPrompt}. Return a JSON array with 5-10 items. Include relevant fields with appropriate data types.`,
                wasEnhanced: true,
                method: 'ai',
            };
        }

        console.log("✅ AI enhanced prompt:");
        console.log("   Original:", userPrompt);
        console.log("   Enhanced:", enhanced);

        return {
            original: userPrompt,
            enhanced,
            wasEnhanced: true,
            method: 'ai',
        };
    } catch (error) {
        console.error("❌ AI enhancement error:", error);
        return {
            original: userPrompt,
            enhanced: `${userPrompt}. Return a JSON array with 5-10 items. Include relevant fields with appropriate data types.`,
            wasEnhanced: true,
            method: 'ai',
        };
    }
}