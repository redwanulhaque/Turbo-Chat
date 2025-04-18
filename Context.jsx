import { createContext, useState } from "react";
import runChat from "../config/Gemini";

export const Context = createContext();

const formatResponse = (text) => {
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")     // **bold**
        .replace(/\*(.*?)\*/g, "<i>$1</i>")         // *italic*
        .replace(/\n\n/g, "<br/><br/>")             // paragraph breaks
        .replace(/\n/g, "<br/>");                   // single line breaks

    const lines = formatted.split("<br/>");
    const stack = [];
    let html = "";

    lines.forEach((line) => {
        const match = line.match(/^(\s*)- (.*)/);
        if (match) {
            const indent = match[1].length;
            const content = match[2];

            // Close deeper or same-level lists
            while (stack.length && stack[stack.length - 1] >= indent) {
                html += "</li></ul>";
                stack.pop();
            }

            // Open new nested list
            if (!stack.length || stack[stack.length - 1] < indent) {
                html += `<ul style="margin-left: ${1.5 * (stack.length + 1)}em;"><li>`;
                stack.push(indent);
            } else {
                html += "</li><li>";
            }

            html += content;
        } else {
            // Close all open lists before continuing
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

const ContextProvider = (props) => {
	const [input, setInput] = useState("");
	const [recentPrompt, setRecentPrompt] = useState("");
	const [prevPrompts, setPrevPrompts] = useState([]);
	const [showResults, setShowResults] = useState(false);
	const [loading, setLoading] = useState(false);
	const [resultData, setResultData] = useState("");

	const newChat = () => {
		setLoading(false);
		setShowResults(false);
	};

	const onSent = async (prompt) => {
		setResultData(""); // Clear previous result cleanly
		setLoading(true);
		setShowResults(true);

		const systemMessage = "You are a helpful assistant named Turbo.";
		const userPrompt = prompt !== undefined ? prompt : input;

		setPrevPrompts((prev) => [...prev, userPrompt]);
		setRecentPrompt(userPrompt);

		try {
			const response = await runChat(`${systemMessage} ${userPrompt}`);
			const formatted = formatResponse(response);

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
		handleKeyPress,
	};

	return (
		<Context.Provider value={contextValue}>
			{props.children}
		</Context.Provider>
	);
};

export default ContextProvider;
