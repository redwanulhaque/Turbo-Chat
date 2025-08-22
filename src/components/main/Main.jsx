// React and context imports
import { useContext, useEffect, useState, useRef } from "react";
import { Context } from "../../context/Context";

// Asset and style imports
import { assets } from "../../assets/assets";
import robot from "../../assets/robot.gif";
import "./main.css";
import resumeData from "../resumeData";

// Main chat component
const Main = () => {
	// Destructuring context values
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

	// Component state
	const [isRecording, setIsRecording] = useState(false); // Tracks mic recording state
	const [recognition, setRecognition] = useState(null); // Holds SpeechRecognition instance
	const [chatHistory, setChatHistory] = useState([]); // Stores chat messages
	const [isUserScrolling, setIsUserScrolling] = useState(false); // Prevents auto-scroll while scrolling manually
	const chatContainerRef = useRef(null); // Reference to chat container for scroll control

	// Set up speech recognition on component mount
	useEffect(() => {
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		if (SpeechRecognition) {
			const recog = new SpeechRecognition();
			recog.lang = "en-US";
			recog.interimResults = false;

			recog.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				setInput(transcript);
				handleSend(transcript); // Automatically send after speech input
			};

			recog.onerror = (event) => {
				console.error("Speech recognition error:", event.error);
			};

			setRecognition(recog);
		} else {
			console.warn("Speech Recognition API not supported.");
		}
	}, []);

	// Auto-scroll to bottom when new messages arrive (unless user is scrolling)
	useEffect(() => {
		if (!isUserScrolling && chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [chatHistory, resultData, loading]);

	// Detects if user is manually scrolling
	const handleScroll = () => {
		if (!chatContainerRef.current) return;
		const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
		const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
		setIsUserScrolling(!isAtBottom);
	};

	// Handles mic icon click to start/stop speech recognition
	const handleMicClick = () => {
		if (isRecording) {
			recognition.stop();
		} else {
			recognition.start();
		}
		setIsRecording(!isRecording);
	};

	// Handles sending a message (either typed or via voice)
	const handleSend = (message) => {
		if (!message.trim()) return;

		const response =
			getResumeResponse(message) ||
			getEducationResponse(message) ||
			getProjectResponse(message) ||
			getSkillResponse(message);

		if (response) {
			setChatHistory((prev) => [...prev, { prompt: message, response }]);
		} else {
			setChatHistory((prev) => [...prev, { prompt: message, response: null }]);
			onSent(message); // Fallback to external handler if no local match
		}

		setInput("");
		setIsUserScrolling(false);
	};

	// Check if user asked about education details
	const getEducationResponse = (message) => {
		const lowerMessage = message.toLowerCase();
		const { school, degree, duration, gpa } = resumeData.education;

		if (
			lowerMessage.includes("education") ||
			lowerMessage.includes("school") ||
			lowerMessage.includes("college")
		) {
			return `Redwanul is currently earning a <strong>${degree}</strong> at <strong>${school}</strong>.<br><strong>Duration:</strong> ${duration}.<br><strong>Current GPA:</strong> ${gpa}.`;
		}
		return null;
	};


	// Check if user asked about work experience
	const getResumeResponse = (message) => {
		const lowerMessage = message.toLowerCase();

		if (
			lowerMessage.includes("experience") ||
			lowerMessage.includes("experiences") ||
			lowerMessage.includes("work history") ||
			lowerMessage.includes("jobs") ||
			lowerMessage.includes("job")
		) {
			return resumeData.experience
				.map(
					(job) =>
						`Redwanul worked at <strong>${job.company}</strong> as a <strong>${job.title}</strong> (<strong>${job.duration}</strong>).<br><br><strong>Responsibilities:</strong><br>- ${job.responsibilities.join(
							"<br>- "
						)}`
				)
				.join("<br><br>");
		}

		for (const job of resumeData.experience) {
			if (
				lowerMessage.includes(job.company.toLowerCase()) ||
				lowerMessage.includes(job.title.toLowerCase())
			) {
				return `Redwanul worked at <strong>${job.company}</strong> as a <strong>${job.title}</strong> (<strong>${job.duration}</strong>). <br><br><strong>Here are some things you did:</strong><br>- ${job.responsibilities.join(
					"<br>- "
				)}`;
			}
		}

		return null;
	};


	// Check if user asked about projects
	const getProjectResponse = (message) => {
		const lowerMessage = message.toLowerCase();

		if (lowerMessage.includes("projects") || lowerMessage.includes("project")) {
			return `Here are your projects:<br><br>${resumeData.projects
				.map(
					(project) =>
						`<strong>${project.name}</strong><br>&nbsp;&nbsp;<strong>Description:</strong>${project.description}`
				)
				.join("<br><br>")}`;
		}

		for (const project of resumeData.projects) {
			if (project.keywords.some((keyword) => lowerMessage.includes(keyword))) {
				return `Project: <strong>${project.name}</strong><br><strong>Description:</strong>${project.description}`;
			}
		}

		return null;
	};


	// Check if user asked about skills
	const getSkillResponse = (message) => {
		const lowerMessage = message.toLowerCase();

		if (
			lowerMessage.includes("skills") ||
			lowerMessage.includes("what am i good at") ||
			lowerMessage.includes("skill")
		) {
			return `Your skills:<br>${Object.entries(resumeData.skills.categories)
				.map(
					([category, skills]) =>
						`- <strong>${category}</strong>: ${skills.join(", ")}`
				)
				.join("<br>")}`;
		}

		for (const [category, skills] of Object.entries(resumeData.skills.categories)) {
			if (lowerMessage.includes(category.toLowerCase())) {
				return `<strong>${category}</strong>: ${skills.join(", ")}`;
			}
		}

		return null;
	};


	// Updates last message with result data when available
	useEffect(() => {
		if (recentPrompt && resultData) {
			setChatHistory((prev) =>
				prev.map((item, index) =>
					index === prev.length - 1 ? { ...item, response: resultData } : item
				)
			);
		}
	}, [resultData, recentPrompt]);

	// JSX rendering the chat interface
	return (
		<div className="main">
			<div className="main-container">
				{/* Intro greeting if chat is empty */}
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

				{/* Chat message display */}
				<div
					className="result"
					ref={chatContainerRef}
					onScroll={handleScroll}
					style={{ overflowY: "auto", maxHeight: "82vh" }}
				>
					{chatHistory.map((item, index) => (
						<div key={index} className="chat-item">
							<div className="result-title">
								<img src={assets.user} alt="User Icon" />
								<p>{item.prompt}</p>
							</div>
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

				{/* Message input section */}
				<div className="main-bottom">
					<div className="search-box">
						<input
							onChange={(e) => setInput(e.target.value)}
							value={input}
							type="text"
							placeholder="Message Turbo"
							onKeyPress={(e) => e.key === "Enter" && handleSend(input)}
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
