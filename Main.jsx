import { useContext, useEffect, useState } from "react";
import { assets } from "../../assets/assets";
import "./main.css";
import { Context } from "../../context/Context";
import robot from '../../assets/robot.gif';

const Main = () => {
	const {
		onSent,
		recentPrompt,
		showResults,
		loading,
		resultData,
		setInput,
		input,
		handleKeyPress, // Import the handleKeyPress function from context
	} = useContext(Context);

	const [isRecording, setIsRecording] = useState(false);
	const [recognition, setRecognition] = useState(null);

	useEffect(() => {
		// Initialize Speech Recognition
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (SpeechRecognition) {
			const recog = new SpeechRecognition();
			recog.lang = 'en-US';
			recog.interimResults = false;
			recog.onresult = (event) => {
				const transcript = event.results[0][0].transcript;
				setInput(transcript);
				onSent(transcript);  // Pass the transcript to onSent to update prevPrompts
			};
			recog.onerror = (event) => {
				console.error("Speech recognition error:", event.error);
			};
			setRecognition(recog);
		} else {
			console.warn("Speech Recognition API not supported.");
		}
	}, [onSent]);

	const handleMicClick = () => {
		if (isRecording) {
			recognition.stop();
		} else {
			recognition.start();
		}
		setIsRecording(!isRecording);
	};

	const handleCardClick = (promptText) => {
		setInput(promptText);
	};

	return (
		<div className="main">
			<div className="main-container">
				{!showResults ? (
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
							<img src={robot} alt="" />
						</div>
					</>
				) : (
					<div className="result">
						<div className="result-title">
							<img src={assets.user} alt="" />
							<p>{recentPrompt}</p>
						</div>

						<div className="result-data">
							<img src={assets.gemini_icon} alt="" style={{ position: 'relative', top: '-10px' }} />
							{loading ? (
								<div className="loader">
									<hr />
									<hr />
									<hr />
								</div>
							) : (
								<p dangerouslySetInnerHTML={{ __html: resultData }}></p>
							)}
						</div>
					</div>
				)}

				<div className="main-bottom">
					<div className="search-box">
						<input
							onChange={(e) => setInput(e.target.value)}
							value={input}
							type="text"
							placeholder="Message Turbo"
							onKeyPress={(e) => handleKeyPress(e)} // Listen for Enter key press
						/>

						<div>
							<img
								src={assets.mic_icon}
								alt=""
								onClick={handleMicClick} // Start/stop recording on click
								style={{ cursor: 'pointer' }}
							/>

							<img
								src={assets.send_icon}
								alt=""
								onClick={() => {
									onSent(input); // Pass the input to onSent
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Main;
