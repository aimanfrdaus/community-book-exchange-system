import { useState } from "react";

const HelpBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hi! 👋 I'm the Community Book Exchange Help Bot. How can I help you?"
        }
    
    ]);

    
const suggestedQuestions = [
    "How do I add a book?",
    "How do I request an exchange?",
    "How do I edit my profile?",
    "I forgot my password."
];

    const faqData = [
        {
            keywords: [
                "register",
                "create account",
                "sign up",
                "signup"
            ],
            answer:
                "To create an account, click Register on the login page and enter your name, email, password and location."
        },
        {
            keywords: [
                "forgot password",
                "reset password",
                "password"
            ],
            answer:
                "If you forgot your password, click Forgot Password on the login page and enter your registered email address."
        },
        {
            keywords: [
                "profile",
                "change profile",
                "edit profile",
                "profile information"
            ],
            answer:
                "Go to the Profile page and click Edit Profile. You can update your name, location and profile picture."
        },
        {
            keywords: [
                "profile picture",
                "profile photo",
                "change picture",
                "change photo"
            ],
            answer:
                "Go to Profile, click Edit Profile, select Change Profile Picture, choose your image and save your changes."
        },
        {
            keywords: [
                "add book",
                "add a book",
                "list book",
                "upload book"
            ],
            answer:
                "Go to My Books and click Add Book. Enter the book details, select the genre and condition, then save the book."
        },
        {
            keywords: [
                "edit book",
                "update book"
            ],
            answer:
                "Go to My Books, find the book you want to change and click Edit Book."
        },
        {
            keywords: [
                "delete book",
                "remove book"
            ],
            answer:
                "Go to My Books and click Delete on the book you want to remove. Confirm the deletion when asked."
        },
        {
            keywords: [
                "search book",
                "find book",
                "search"
            ],
            answer:
                "Go to Browse Books and use the search box to search by book title or author."
        },
        {
            keywords: [
                "request exchange",
                "request book",
                "exchange request",
                "request"
            ],
            answer:
                "Go to Browse Books, find the book you want and click Request Exchange. Confirm your request to send it to the owner."
        },
        {
            keywords: [
                "my request",
                "my requests",
                "exchange requests"
            ],
            answer:
                "Go to My Exchange Requests to view the books you have requested and check their exchange status."
        },
        {
            keywords: [
                "accept request",
                "incoming request",
                "incoming requests"
            ],
            answer:
                "Go to Incoming Requests to view exchange requests for your books. You can accept or reject the requests there."
        },
        {
            keywords: [
                "meetup",
                "meeting",
                "arrange meetup"
            ],
            answer:
                "After an exchange request is accepted, you can use the meetup section to arrange the date, time and location for the exchange."
        },
        {
            keywords: [
                "complete exchange",
                "mark completed",
                "completed exchange"
            ],
            answer:
                "After the exchange has taken place, use Mark as Completed on the exchange request."
        },
        {
            keywords: [
                "rating",
                "rate user",
                "review user"
            ],
            answer:
                "After an exchange is completed, you can submit a rating for the other user through the exchange request."
        },
        {
            keywords: [
                "notification",
                "notifications"
            ],
            answer:
                "Click Notifications in the sidebar to view updates about exchange requests and other system activities."
        },
        {
            keywords: [
                "hello",
                "hi",
                "hey"
            ],
            answer:
                "Hello! 👋 How can I help you with the Community Book Exchange System?"
        }
    ];

    const findAnswer = (userMessage) => {
        const text = userMessage
            .toLowerCase()
            .replace(/[?!.,]/g, "");

        let bestMatch = null;
        let highestScore = 0;

        for (const faq of faqData) {
            let score = 0;

            for (const keyword of faq.keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    score += keyword.split(" ").length;
                }
            }

            if (score > highestScore) {
                highestScore = score;
                bestMatch = faq;
            }
        }

        if (bestMatch) {
            return bestMatch.answer;
        }

        return "I'm sorry, I don't have an answer for that yet. You can check the FAQs page for more information.";
    };

    const sendMessage = () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
            return;
        }

        const botAnswer = findAnswer(trimmedMessage);

        setMessages((currentMessages) => [
            ...currentMessages,
            {
                sender: "user",
                text: trimmedMessage
            },
            {
                sender: "bot",
                text: botAnswer
            }
        ]);

        setMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    const sendSuggestedQuestion = (question) => {
    const botAnswer = findAnswer(question);

    setMessages((currentMessages) => [
        ...currentMessages,
        {
            sender: "user",
            text: question
        },
        {
            sender: "bot",
            text: botAnswer
        }
    ]);
};

const clearChat = () => {
    setMessages([
        {
            sender: "bot",
            text: "Hi! 👋 I'm the Community Book Exchange Help Bot. How can I help you?"
        }
    ]);

    setMessage("");
};

    return (
        <>
            {/* Floating Bot Button */}
            <button
                className="help-bot-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open Help Bot"
            >
                🤖
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="help-bot-window">

            <div className="help-bot-header">

                <div>
                    <strong>Help Bot</strong>

                    <span>
                        Community Book Exchange
                    </span>
                </div>

                <div className="help-bot-header-actions">

                    <button
                        className="help-bot-clear"
                        onClick={clearChat}
                        title="Clear chat"
                    >
                        Clear
                    </button>

                    <button
                        className="help-bot-close"
                        onClick={() => setIsOpen(false)}
                        title="Close"
                    >
                        ×
                    </button>

                </div>

            </div>

                    <div className="help-bot-messages">

                        {messages.length === 1 && (
                            <div className="help-bot-suggestions">

                                <p>Suggested questions</p>

                                {suggestedQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        className="help-bot-suggestion"
                                        onClick={() =>
                                            sendSuggestedQuestion(question)
                                        }
                                    >
                                        {question}
                                    </button>
                                ))}

                            </div>
                        )}

                        {messages.map((item, index) => (
                            <div
                                key={index}
                                className={`help-bot-message ${
                                    item.sender === "user"
                                        ? "user-message"
                                        : "bot-message"
                                }`}
                            >
                                {item.text}
                            </div>
                        ))}

                    </div>


                    <div className="help-bot-input-area">

                        <input
                            type="text"
                            placeholder="Ask a question..."
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            onClick={sendMessage}
                        >
                            ➤
                        </button>

                    </div>

                </div>
            )}
        </>
    );
};

export default HelpBot;