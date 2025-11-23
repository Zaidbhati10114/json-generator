// lib/logrocket.ts
import LogRocket from 'logrocket';

const isProduction = process.env.NODE_ENV === 'production';
//const isProduction = true;
const appId = process.env.NEXT_PUBLIC_LOGROCKET_APP_ID;

export const initLogRocket = (): void => {
    // Only initialize in production and if app ID exists
    if (isProduction && appId) {
        try {
            LogRocket.init(appId, {
                // Console logging
                console: {
                    shouldAggregateConsoleErrors: true,
                },

                // Network logging
                network: {
                    requestSanitizer: (request) => {
                        // Sanitize sensitive headers
                        if (request.headers['Authorization']) {
                            request.headers['Authorization'] = '[REDACTED]';
                        }
                        if (request.headers['x-api-key']) {
                            request.headers['x-api-key'] = '[REDACTED]';
                        }
                        return request;
                    },
                    responseSanitizer: (response) => {
                        // Sanitize sensitive response data
                        return response;
                    },
                },

                // DOM recording
                dom: {
                    inputSanitizer: true, // Automatically sanitize input fields
                    textSanitizer: true, // Sanitize text content
                },

                // Privacy settings
                shouldCaptureIP: false, // Don't capture IP addresses

                // Performance
                mergeIframes: true,
                parentDomain: process.env.NEXT_PUBLIC_APP_URL,
            });

            console.log('✅ LogRocket initialized');
        } catch (error) {
            console.error('❌ LogRocket initialization failed:', error);
        }
    } else if (!isProduction) {
        console.log('ℹ️ LogRocket disabled in development');
    } else if (!appId) {
        console.warn('⚠️ LogRocket App ID not found');
    }
};

// Identify anonymous user session
export const identifyAnonymousUser = (): void => {
    if (isProduction && appId) {
        // Generate or retrieve anonymous session ID
        let sessionId = sessionStorage.getItem('lr_session_id');

        if (!sessionId) {
            sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('lr_session_id', sessionId);
        }

        LogRocket.identify(sessionId, {
            userType: 'anonymous',
            firstVisit: new Date().toISOString(),
        });
    }
};

// Track custom events
export const trackEvent = (
    eventName: string,
    properties?: Record<string, string | number | boolean | string[] | number[] | boolean[] | null> // ✅ Fixed type
): void => {
    if (isProduction && appId) {
        LogRocket.track(eventName, properties);
    }
};

// Capture exceptions manually
export const captureException = (error: Error, tags?: Record<string, string>): void => {
    if (isProduction && appId) {
        LogRocket.captureException(error, {
            tags,
        });
    }
};

export default LogRocket;