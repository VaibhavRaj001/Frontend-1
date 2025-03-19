import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./App.css";

const App = () => {
  const [numReviews, setNumReviews] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [heatmapUrl, setHeatmapUrl] = useState(null);
  const [piechartUrl, setPiechartUrl] = useState(null);
  const [stage, setStage] = useState("askNumber");

  const handleNumReviewsSubmit = () => {
    const count = parseInt(numReviews);
    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid number of reviews.");
      return;
    }
    setReviews(new Array(count).fill(""));
    setStage("collectReviews");
  };
  const [modalImage, setModalImage] = useState(null);

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  const closeModal = () => {
    setModalImage(null);
  };


  const handleReviewSubmit = () => {
    if (!reviewText.trim()) return;

    const updatedReviews = [...reviews];
    updatedReviews[currentReviewIndex] = reviewText;
    setReviews(updatedReviews);
    setReviewText("");

    if (currentReviewIndex + 1 < reviews.length) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    } else {
      analyzeReviews(updatedReviews);
    }
  };

  const analyzeReviews = async (collectedReviews) => {
    setLoading(true);
    try {
      const response = await axios.post("https://backend-4-8fik.onrender.com/visualize/", {
        texts: collectedReviews,
      });

      setReviews(response.data.results || []);
      setHeatmapUrl(`${response.data.heatmap_url}?timestamp=${new Date().getTime()}`);
      setPiechartUrl(`${response.data.piechart_url}?timestamp=${new Date().getTime()}`);
      setStage("displayResults");
    } catch (error) {
      console.error("Error analyzing reviews:", error);
      setReviews([]);
    }
    setLoading(false);
  };

  // Function to go back to the previous stage
  const handleGoBack = () => {
    if (stage === "collectReviews") {
      setStage("askNumber");
      setReviews([]);
      setNumReviews("");
      setCurrentReviewIndex(0);
    } else if (stage === "displayResults") {
      setStage("collectReviews");
      setCurrentReviewIndex(0);
    }
  };

  return (
    <motion.div className="app-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <div className="content-container">
        <motion.h1 className="header-title">🎬 Movie Review Sentiment Analysis</motion.h1>

        {stage === "askNumber" && (
          <motion.div className="input-section" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <input
              className="review-input"
              type="number"
              placeholder="Enter number of reviews"
              value={numReviews}
              onChange={(e) => setNumReviews(e.target.value)}
            />
            <motion.button whileHover={{ scale: 1.1 }} className="submit-button" onClick={handleNumReviewsSubmit}>
              Next ➡️
            </motion.button>
          </motion.div>
        )}

        {stage === "collectReviews" && (
          <motion.div className="input-section" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <h2>Review {currentReviewIndex + 1} of {reviews.length}</h2>
            <textarea
              className="review-textarea"
              placeholder="✍️ Write your movie review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            {/* Buttons Container for Back and Next */}
            <div className="button-container">
              {/* Back to Previous Review Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="prev-button"
                onClick={() => {
                  if (currentReviewIndex > 0) {
                    setCurrentReviewIndex(currentReviewIndex - 1);
                    setReviewText(reviews[currentReviewIndex - 1] || ""); // Load previous review
                  }
                }}
                disabled={currentReviewIndex === 0} // Disable on first review
              >
                ⬅️ Previous
              </motion.button>

              {/* Next Review / Analyze Button */}
              <motion.button whileHover={{ scale: 1.1 }} className="submit-button" onClick={handleReviewSubmit}>
                {currentReviewIndex + 1 < reviews.length ? "Next ➡️" : "Analyze Reviews"}
              </motion.button>
            </div>
          </motion.div>
        )}


        {/* Show loading spinner while waiting for results */}
        {loading && (
          <motion.div className="loading-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="spinner"></div>
            <p>Analyzing Reviews...</p>
          </motion.div>
        )}

        {stage === "displayResults" && !loading && (
          <>
            <motion.h2>📊 Sentiment Analysis Results</motion.h2>
            <div className="results-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Review</th>
                    <th>Sentiment</th>
                    <th>IMDb Rating</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review, index) => (
                    <tr key={index}>
                      <td>{review.Review}</td>
                      <td>{review.Sentiment}</td>
                      <td>{review["IMDb Rating"]}</td>
                      <td>{review.Confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Heatmap and Pie Chart aligned horizontally */}
            <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              📊 Sentiment Visualization
            </motion.h2>
            <div className="visualization-container">
              {heatmapUrl && <motion.img whileHover={{ scale: 1.1 }} src={heatmapUrl} alt="Sentiment Heatmap" onClick={() => openModal(heatmapUrl)} />}
              {piechartUrl && <motion.img whileHover={{ scale: 1.1 }} src={piechartUrl} alt="Sentiment Pie Chart" onClick={() => openModal(piechartUrl)} />}
            </div>

            {/* Add description below images */}
            <p className="visualization-text">
              This heat map shows the distribution of different reviews vs imdb rating along with the confidence sentiment score, while the pie chart
              shows the distribution of overall sentiment categories.
            </p>

            <motion.button whileHover={{ scale: 1.1 }} className="back-button" onClick={handleGoBack}>
              ⬅️ Go Back
            </motion.button>

            {/* Fullscreen Modal */}
            {modalImage && (
              <div className="modal" onClick={closeModal}>
                <span className="modal-close">&times;</span>
                <img src={modalImage} alt="Enlarged Visualization" />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default App;
