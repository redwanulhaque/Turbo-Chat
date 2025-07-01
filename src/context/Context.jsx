// Import React context and state hooks
import { createContext, useState } from "react";
import runChat from "../config/Gemini";

// Create a global context for the chat application
export const Context = createContext();

// Format AI response to HTML (handles markdown-like bold, italic, and lists)
const formatResponse = (text) => {
	let formatted = text
		.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")     // Convert **bold** to <b>
		.replace(/\*(.*?)\*/g, "<i>$1</i>")         // Convert *italic* to <i>
		.replace(/\n\n/g, "<br/><br/>")             // Double newlines to paragraph breaks
		.replace(/\n/g, "<br/>");                   // Single newline to line break

	const lines = formatted.split("<br/>");
	const stack = [];
	let html = "";

	lines.forEach((line) => {
		const match = line.match(/^(\s*)[-*] (.*)/); // Match list items with optional indentation
		if (match) {
			const indent = match[1].length;
			const content = match[2];

			// Close deeper or same-level lists
			while (stack.length && stack[stack.length - 1] >= indent) {
				html += "</li></ul>";
				stack.pop();
			}

			// Start a new nested list
			if (!stack.length || stack[stack.length - 1] < indent) {
				html += `<ul style="margin-left: ${1.5 * (stack.length + 1)}em;"><li>`;
				stack.push(indent);
			} else {
				html += "</li><li>";
			}

			html += content;
		} else {
			// Close open lists if the line is not part of a list
			while (stack.length) {
				html += "</li></ul>";
				stack.pop();
			}
			html += line + "<br/>";
		}
	});

	// Close any remaining open lists
	while (stack.length) {
		html += "</li></ul>";
		stack.pop();
	}

	return html;
};

// React context provider component to share state across components
const ContextProvider = (props) => {
	const [input, setInput] = useState("");
	const [recentPrompt, setRecentPrompt] = useState("");
	const [prevPrompts, setPrevPrompts] = useState([]);
	const [showResults, setShowResults] = useState(false);
	const [loading, setLoading] = useState(false);
	const [resultData, setResultData] = useState("");

	// Reset to initial state for a new conversation
	const newChat = () => {
		setLoading(false);
		setShowResults(false);
	};

	// Sends the user prompt to Gemini and processes the response
	const onSent = async (prompt) => {
		setResultData("");
		setLoading(true);
		setShowResults(true);

		const systemMessage = "You are a helpful assistant named Turbo.";
		const userPrompt = prompt !== undefined ? prompt : input;

		setPrevPrompts((prev) => [...prev, userPrompt]);
		setRecentPrompt(userPrompt);

		try {
			const response = await runChat(`${systemMessage} ${userPrompt}`);
			const formatted = formatResponse(response);

			// Simulate typing effect for response
			let i = 0;
			let result = "";
			const interval = setInterval(() => {
				if (i < formatted.length) {
					result += formatted[i];
					setResultData(result);
					i++;
				} else {
					clearInterval(interval);
				}
			}, 1);
		} catch (error) {
			console.error("Error while running chat:", error);
		} finally {
			setLoading(false);
			setInput("");
		}
	};

	// Detect "Enter" key press to send input
	const handleKeyPress = (event) => {
		if (event.key === "Enter") {
			onSent();
		}
	};

	// Values made available to components via Context
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
		handleKeyPress,
	};

	// Wrap children in Context Provider
	return (
		<Context.Provider value={contextValue}>
			{props.children}
		</Context.Provider>
	);
};

export default ContextProvider;
