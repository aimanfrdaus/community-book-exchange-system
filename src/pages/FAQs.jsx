import { useState } from "react";

const FAQs = () => {
    const [search, setSearch] = useState("");
    const [openFAQ, setOpenFAQ] = useState(null);

    const faqs = [
        {
            category: "Account & Profile",
            question: "How do I create an account?",
            answer:
                "Click Register on the login page and enter your name, email, password and location. After registration, you can log in to the system."
        },
        {
            category: "Account & Profile",
            question: "How do I change my profile information?",
            answer:
                "Go to the Profile page and click Edit Profile. You can update your name, location and profile picture."
        },
        {
            category: "Account & Profile",
            question: "How do I change my profile picture?",
            answer:
                "Go to Profile and click Edit Profile. Select Change Profile Picture, choose an image and click Save Changes."
        },
        {
            category: "Account & Profile",
            question: "I forgot my password. What should I do?",
            answer:
                "Click Forgot Password on the login page. Enter your registered email address and follow the instructions sent to your email."
        },

        {
            category: "Books",
            question: "How do I add a book?",
            answer:
                "Go to My Books and click Add Book. Enter the book details, select the genre and condition, add a description and upload a book cover if needed."
        },
        {
            category: "Books",
            question: "How do I edit my book?",
            answer:
                "Go to My Books and select the book you want to edit. Click Edit Book, update the information and save your changes."
        },
        {
            category: "Books",
            question: "How do I delete my book?",
            answer:
                "Go to My Books and click Delete on the book you want to remove. A confirmation message will appear before the book is deleted."
        },
        {
            category: "Books",
            question: "How do I search for a book?",
            answer:
                "Go to Browse Books and use the search box to search by book title or author."
        },

        {
            category: "Exchange",
            question: "How do I request a book exchange?",
            answer:
                "Go to Browse Books and find the book you want. Click Request Exchange and confirm your request."
        },
        {
            category: "Exchange",
            question: "What happens after I request an exchange?",
            answer:
                "The book owner will receive your exchange request. The owner can accept or reject the request."
        },
        {
            category: "Exchange",
            question: "How do I check my exchange requests?",
            answer:
                "Go to My Exchange Requests to view the books you have requested and check their current status."
        },
        {
            category: "Exchange",
            question: "How do I accept an exchange request?",
            answer:
                "If another user requests one of your books, go to Incoming Requests. You can accept or reject the request there."
        },
        {
            category: "Exchange",
            question: "How do I complete an exchange?",
            answer:
                "After the exchange has been completed between both users, the relevant user can select Mark as Completed from the exchange request."
        },

        {
            category: "Meetup",
            question: "How do I arrange a meetup?",
            answer:
                "After an exchange request has been accepted, you can use the meetup section to arrange the date, time and location for the exchange."
        },

        {
            category: "Ratings",
            question: "How do I rate another user?",
            answer:
                "After an exchange is completed, you can submit a rating for the other user through the exchange request."
        },

        {
            category: "Notifications",
            question: "Where can I see my notifications?",
            answer:
                "Click Notifications in the sidebar to view notifications about exchange requests, accepted or rejected requests and other system updates."
        }
    ];

    const filteredFAQs = faqs.filter((faq) => {
        const searchText = search.toLowerCase();

        return (
            faq.question.toLowerCase().includes(searchText) ||
            faq.answer.toLowerCase().includes(searchText) ||
            faq.category.toLowerCase().includes(searchText)
        );
    });

    const toggleFAQ = (index) => {
        setOpenFAQ(
            openFAQ === index ? null : index
        );
    };

    return (
        <div className="faq-page">

            <div className="page-header">
                <div>
                <h1>Frequently Asked Questions</h1>

                <p>
                    Find answers to common questions about using
                    the Community Book Exchange System.
                </p>
                </div>
            </div>

            <div className="faq-search">
                <span>🔎</span>

                <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />
            </div>

            <div className="faq-list">

                {filteredFAQs.length === 0 ? (

                    <div className="faq-empty">
                        <div>🔎</div>

                        <h3>
                            No matching questions
                        </h3>

                        <p>
                            Try using different keywords.
                        </p>
                    </div>

                ) : (

                    filteredFAQs.map((faq, index) => (

                        <div
                            className="faq-item"
                            key={index}
                        >

                            <button
                                className="faq-question"
                                onClick={() =>
                                    toggleFAQ(index)
                                }
                            >

                                <div>
                                    <span className="faq-category">
                                        {faq.category}
                                    </span>

                                    <span className="faq-question-text">
                                        {faq.question}
                                    </span>
                                </div>

                                <span className="faq-arrow">
                                    {openFAQ === index
                                        ? "▲"
                                        : "▼"}
                                </span>

                            </button>

                            {openFAQ === index && (
                                <div className="faq-answer">
                                    {faq.answer}
                                </div>
                            )}

                        </div>

                    ))

                )}

            </div>

        </div>
    );
};

export default FAQs;