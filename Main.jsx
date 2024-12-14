import { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import "./main.css";
import { Context } from "../../context/Context";
import robot from "../../assets/robot.gif";

const Main = () => {
	const {
		onSent,
		recentPrompt,
		showResults,
		loading,
		resultData,
		setInput,
		input,
		handleKeyPress,
	} = useContext(Context);

	const [isRecording, setIsRecording] = useState(false);
	const [recognition, setRecognition] = useState(null);
	const [chatHistory, setChatHistory] = useState([]); // To store chat history

	useEffect(() => {
		// Initialize Speech Recognition
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (SpeechRecognition) {
			const recog = new SpeechRecognition();
			recog.lang = "en-US";
			recog.interimResults = false;
			recog.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				setInput(transcript);
				handleSend(transcript); // Send transcript to chat
			};
			recog.onerror = (event) => {
				console.error("Speech recognition error:", event.error);
			};
			setRecognition(recog);
		} else {
			console.warn("Speech Recognition API not supported.");
		}
	}, []);

	const handleMicClick = () => {
		if (isRecording) {
			recognition.stop();
		} else {
			recognition.start();
		}
		setIsRecording(!isRecording);
	};

	const handleSend = (message) => {
		if (!message.trim()) return;
		setChatHistory((prev) => [...prev, { prompt: message, response: null }]);
		onSent(message); // Fetch AI response
	};

	useEffect(() => {
		// Update chat history with AI response when resultData changes
		if (recentPrompt && resultData) {
			setChatHistory((prev) =>
				prev.map((item, index) =>
					index === prev.length - 1 ? { ...item, response: resultData } : item
				)
			);
		}
	}, [resultData, recentPrompt]);

	return (
		<div className="main">
			<div className="main-container">
				{/* Greeting Section */}
				{chatHistory.length === 0 && !loading && (
					<>
						<div className="greet">
							<p>
								<span className="typing">Hello, my name is Turbo</span>
							</p>
						</div>

						<div className="wrapper four">
							<div className="type">
								<h3 className="typing">How can I assist you today?</h3>
							</div>
						</div>

						<div className="robot">
							<img src={robot} alt="Greeting Robot" />
						</div>
					</>
				)}

				{/* Chat History Section */}
				<div className="result">
					{chatHistory.map((item, index) => (
						<div key={index} className="chat-item">
							{/* User's message */}
							<div className="result-title">
								<img src={assets.user} alt="User Icon" />
								<p>{item.prompt}</p>
							</div>
							{/* AI's response */}
							<div className="result-data">
								<img
									src={assets.gemini_icon}
									alt="AI Icon"
									style={{ position: "relative", top: "-10px" }}
								/>
								{item.response ? (
									<p dangerouslySetInnerHTML={{ __html: item.response }}></p>
								) : (
									loading && (
										<div className="loader">
											<hr />
											<hr />
											<hr />
										</div>
									)
								)}
							</div>
						</div>
					))}
				</div>

				{/* Input Section */}
				<div className="main-bottom">
					<div className="search-box">
						<input
							onChange={(e) => setInput(e.target.value)}
							value={input}
							type="text"
							placeholder="Message Turbo"
							onKeyPress={(e) =>
								e.key === "Enter" && handleSend(input) // Send message on Enter
							}
						/>
						<div>
							<img
								src={assets.mic_icon}
								alt="Mic Icon"
								onClick={handleMicClick}
								style={{ cursor: "pointer" }}
							/>
							<img
								src={assets.send_icon}
								alt="Send Icon"
								onClick={() => handleSend(input)} // Send message on click
								style={{ cursor: "pointer" }}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Main;
