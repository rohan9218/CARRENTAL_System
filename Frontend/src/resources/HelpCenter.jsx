import { motion } from "motion/react";
import { useState } from "react";
import { FaCar, FaCreditCard, FaHeadset, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const topics = [
  { title: "Booking Help", desc: "Quick guide to book your car hassle-free.", icon: <FaCar size={28} /> },
  { title: "Payment Help", desc: "All about payments, refunds, and invoices.", icon: <FaCreditCard size={28} /> },
  { title: "Account Help", desc: "Manage login, profile, and preferences.", icon: <FaUser size={28} /> },
  { title: "Support", desc: "Contact support for any assistance.", icon: <FaHeadset size={28} /> },
];

const faqData = [
  { question: "How do I book a car?", answer: "Select your dates, choose your car, and complete payment to confirm booking." },
  { question: "What payment methods are accepted?", answer: "Credit/debit cards, UPI, net banking, and wallets are supported." },
  { question: "Can I cancel my booking?", answer: "Cancellations allowed up to 24 hours before pickup." },
  { question: "How do I reset my password?", answer: "Click 'Forgot Password' on login and follow instructions." },
  { question: "How can I contact support?", answer: "Email support@carrental.com or call 1800-123-456." },
];

const HelpCenter = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-indigo-600 text-white py-28 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Need Help?</h1>
        <p className="text-lg md:text-xl max-w-2xl">
          Browse topics below or check our FAQs to quickly find answers to your questions.
        </p>
      </section>

      {/* Topics Section */}
      <section className="py-20 px-6 md:px-16 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">Explore Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {topics.map((topic, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-lg p-8 text-center cursor-pointer hover:shadow-xl transition"
            >
              <div className="text-indigo-600 mb-4 flex justify-center">{topic.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
              <p className="text-gray-600">{topic.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-100 px-6 md:px-16 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqData.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <button
                onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                className="w-full text-left flex justify-between items-center font-medium text-lg focus:outline-none"
              >
                <span>{faq.question}</span>
                <span className="text-indigo-600 text-2xl">{activeFAQ === idx ? "−" : "+"}</span>
              </button>
              <div
                className={`mt-3 text-gray-700 transition-all duration-300 ease-in-out ${
                  activeFAQ === idx ? "max-h-96" : "max-h-0 overflow-hidden"
                }`}
              >
                {faq.answer}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Still Need Assistance?</h2>
        <p className="mb-8 max-w-2xl mx-auto text-gray-700">
          Contact our support team and we’ll get back to you as soon as possible.
        </p>
        <button
          onClick={() => navigate("/teamservice")}
          className="bg-indigo-600 text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition"
        >
          Contact Support
        </button>
      </section>
    </div>
  );
};

export default HelpCenter;
