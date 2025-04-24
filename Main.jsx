import { useContext, useEffect, useState, useRef } from "react";
import { assets } from "../../assets/assets";
import "./main.css";
import { Context } from "../../context/Context";
import robot from "../../assets/robot.gif";
import resumeData from "../resumeData";

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
	const [chatHistory, setChatHistory] = useState([]);
	const [isUserScrolling, setIsUserScrolling] = useState(false);
	const chatContainerRef = useRef(null);

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
				handleSend(transcript);
			};
			recog.onerror = (event) => {
				console.error("Speech recognition error:", event.error);
			};
			setRecognition(recog);
		} else {
			console.warn("Speech Recognition API not supported.");
		}
	}, []);

	// Smart scroll behavior
	useEffect(() => {
		if (!isUserScrolling && chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	}, [chatHistory, resultData, loading]);

	const handleScroll = () => {
		if (!chatContainerRef.current) return;
		const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
		const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
		setIsUserScrolling(!isAtBottom);
	};

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

		const response =
			getResumeResponse(message) ||
			getEducationResponse(message) ||
			getProjectResponse(message) ||
			getSkillResponse(message);

		if (response) {
			setChatHistory((prev) => [...prev, { prompt: message, response }]);
		} else {
			setChatHistory((prev) => [...prev, { prompt: message, response: null }]);
			onSent(message);
		}
		setInput("");
		setIsUserScrolling(false);
	};

	const getEducationResponse = (message) => {
		const lowerMessage = message.toLowerCase();
		const { school, degree, duration, gpa } = resumeData.education;

		if (
			lowerMessage.includes("education") ||
			lowerMessage.includes("school") ||
			lowerMessage.includes("college")
		) {
			return `Redwanul is currently earning a ${degree} at ${school}. Duration: ${duration}. Current GPA: ${gpa}.`;
		}
		return null;
	};

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
						`Redwanul worked at ${job.company} as a ${job.title} (${job.duration}).\nResponsibilities:\n- ${job.responsibilities.join(
							"\n- "
						)}`
				)
				.join("\n\n");
		}

		for (const job of resumeData.experience) {
			if (
				lowerMessage.includes(job.company.toLowerCase()) ||
				lowerMessage.includes(job.title.toLowerCase())
			) {
				return `Redwanul worked at ${job.company} as a ${job.title} (${job.duration}). Here are some things you did:\n- ${job.responsibilities.join(
					"\n- "
				)}`;
			}
		}

		return null;
	};

	const getProjectResponse = (message) => {
		const lowerMessage = message.toLowerCase();

		if (lowerMessage.includes("projects") || lowerMessage.includes("project")) {
			return `Here are your projects:\n\n${resumeData.projects
				.map(
					(project) =>
						`**${project.name}**\n  Description: ${project.description}`
				)
				.join("\n\n")}`;
		}

		for (const project of resumeData.projects) {
			if (project.keywords.some((keyword) => lowerMessage.includes(keyword))) {
				return `Project: ${project.name}\nDescription: ${project.description}`;
			}
		}

		return null;
	};

	const getSkillResponse = (message) => {
		const lowerMessage = message.toLowerCase();

		if (
			lowerMessage.includes("skills") ||
			lowerMessage.includes("what am i good at") ||
			lowerMessage.includes("skill")
		) {
			return `Your skills:\n${Object.entries(resumeData.skills.categories)
				.map(([category, skills]) => `- ${category}: ${skills.join(", ")}`)
				.join("\n")}`;
		}

		for (const [category, skills] of Object.entries(resumeData.skills.categories)) {
			if (lowerMessage.includes(category.toLowerCase())) {
				return `${category}: ${skills.join(", ")}`;
			}
		}

		return null;
	};

	useEffect(() => {
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

				{/* Chat Section */}
				<div
					className="result"
					ref={chatContainerRef}
					onScroll={handleScroll}
					style={{ overflowY: "auto", maxHeight: "70vh" }}
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

				{/* Input Section */}
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
