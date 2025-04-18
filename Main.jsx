import { useContext, useEffect, useState, useRef } from "react";
import { assets } from "../../assets/assets";
import "./main.css";
import { Context } from "../../context/Context";
import robot from "../../assets/robot.gif";
import resumeData from "../resumeData"; // Import resume data

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
	const [chatHistory, setChatHistory] = useState([]); // Store chat history

	// Ref to scroll the chat container
	const chatContainerRef = useRef(null);

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

	useEffect(() => {
		// Scroll to the bottom of the chat container when new chat history is added
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [chatHistory]); // Trigger on chatHistory change

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
	
		// Check if message is related to resume (education, experience, projects, or skills)
		const response =
			getResumeResponse(message) ||
			getEducationResponse(message) ||
			getProjectResponse(message) ||
			getSkillResponse(message);
	
		if (response) {
			setChatHistory((prev) => [...prev, { prompt: message, response }]);
		} else {
			// If no resume match, send to AI
			setChatHistory((prev) => [...prev, { prompt: message, response: null }]);
			onSent(message); // Fetch AI response
		}
	
		// Clear the input field after sending the message
		setInput("");
	};

	// Function to search for resume experience
	const getResumeResponse = (message) => {
		const lowerMessage = message.toLowerCase();

		for (const job of resumeData.experience) {
			if (lowerMessage.includes(job.company.toLowerCase()) || lowerMessage.includes(job.title.toLowerCase())) {
				return `You worked at ${job.company} as a ${job.title} (${job.duration}). Here are some things you did:\n- ${job.responsibilities.join("\n- ")}`;
			}
		}
		return null;
	};

	// Function to search for education details
	const getEducationResponse = (message) => {
		const lowerMessage = message.toLowerCase();
		const { school, degree, duration, gpa } = resumeData.education;

		if (lowerMessage.includes("education") || lowerMessage.includes("school") || lowerMessage.includes("college")) {
			return `You are currently earning a ${degree} at ${school}. Duration: ${duration}. Current GPA: ${gpa}.`;
		}
		return null;
	};

	// Function to search for project details
	const getProjectResponse = (message) => {
		const lowerMessage = message.toLowerCase();

		// General project query
		if (lowerMessage.includes("projects") || lowerMessage.includes("my projects")) {
			return `Here are your projects:\n- ${resumeData.projects.map(p => p.name).join("\n- ")}`;
		}

		// Check for a specific project name
		for (const project of resumeData.projects) {
			if (project.keywords.some(keyword => lowerMessage.includes(keyword))) {
				return `Project: ${project.name}\nDescription: ${project.description}`;
			}
		}
		return null;
	};

	// Function to search for skills
	const getSkillResponse = (message) => {
		const lowerMessage = message.toLowerCase();

		// General skills query
		if (lowerMessage.includes("skills") || lowerMessage.includes("what am i good at")) {
			return `Your skills:\n${Object.entries(resumeData.skills.categories)
				.map(([category, skills]) => `- ${category}: ${skills.join(", ")}`)
				.join("\n")}`;
		}

		// Check for category-specific skills
		for (const [category, skills] of Object.entries(resumeData.skills.categories)) {
			if (lowerMessage.includes(category.toLowerCase())) {
				return `${category}: ${skills.join(", ")}`;
			}
		}

		return null;
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
				<div className="result" ref={chatContainerRef}>
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
									<div
										className="ai-response"
										dangerouslySetInnerHTML={{ __html: item.response }}
									/>
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
								e.key === "Enter" && handleSend(input)
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
								onClick={() => handleSend(input)}
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
