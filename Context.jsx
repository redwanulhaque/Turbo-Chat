import { createContext, useState } from "react";
import runChat from "../config/Gemini";
export const Context = createContext();

const ContextProvider = (props) => {
	const [input, setInput] = useState("");
	const [recentPrompt, setRecentPrompt] = useState("");
	const [prevPrompts, setPrevPrompts] = useState([]);
	const [showResults, setShowResults] = useState(false);
	const [loading, setLoading] = useState(false);
	const [resultData, setResultData] = useState("");

	const delayPara = (index, nextWord) => {
		setTimeout(function () {
			setResultData((prev) => prev + nextWord);
		}, 10 * index);
	};

	const newChat = () => {
		setLoading(false);
		setShowResults(false);
	};

	const onSent = async (prompt) => {
		setResultData("");
		setLoading(true);
		setShowResults(true);
		let response;
		const systemMessage = "You are a helpful assistant named Turbo.";

		if (prompt !== undefined) {
			setPrevPrompts((prev) => [...prev, prompt]);  // Update prevPrompts
			setRecentPrompt(prompt);
			response = await runChat(`${systemMessage} ${prompt}`);
		} else {
			setPrevPrompts((prev) => [...prev, input]);  // Update prevPrompts
			setRecentPrompt(input);
			response = await runChat(`${systemMessage} ${input}`);
		}

		try {
			let responseArray = response.split("**");
			let newResponse = "";

			for (let i = 0; i < responseArray.length; i++) {
				if (i === 0 || i % 2 !== 1) {
					newResponse += responseArray[i];
				} else {
					newResponse += "<b>" + responseArray[i] + "</b>";
				}
			}

			let newResponse2 = newResponse.split("*").join("<br/>");
			let newResponseArray = newResponse2.split("");

			for (let i = 0; i < newResponseArray.length; i++) {
				const nextWord = newResponseArray[i];
				delayPara(i, nextWord + "");
			}
			
		} catch (error) {
			console.error("Error while running chat:", error);
		} finally {
			setLoading(false);
			setInput("");
		}
	};

	// Function to handle Enter key press
	const handleKeyPress = (event) => {
		if (event.key === "Enter") {
			onSent();
		}
	};

	const contextValue = {
		prevPrompts,
		setPrevPrompts,
		onSent,
		setRecentPrompt,
		recentPrompt,
		input,
		setInput,
		showResults,
		loading,
		resultData,
		newChat,
		handleKeyPress, // Expose the handleKeyPress function
	};

	return (
		<Context.Provider value={contextValue}>{props.children}</Context.Provider>
	);
};

export default ContextProvider;

