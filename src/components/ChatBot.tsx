import { useEffect, useState } from "react";

import ChatBotContainer from "./ChatBotContainer";
import { parseBotOptions } from "../services/BotOptionsService";
import { defaultFlow, isDesktop } from "../services/Utils";
import { BotOptionsContext } from "../context/BotOptionsContext";
import { MessagesContext } from "../context/MessagesContext";
import { PathsContext } from "../context/PathsContext";
import { Options } from "../types/Options";
import { Flow } from "../types/Flow";
import { Message } from "../types/Message";
import { Theme } from "../types/Theme";

/**
 * Initializes providers for chatbot.
 *
 * @param flow conversation flow for the bot
 * @param options options to setup the bot
 * @param themes themes to apply to the bot
 */
const ChatBot = ({
	flow,
	options,
	themes,
}: {
	flow?: Flow,
	options?: Options
	themes?: undefined | Theme | Array<Theme>,
}) => {

	// handles loading of chatbot only when options is loaded
	const [optionsLoaded, setOptionsLoaded] = useState<boolean>(false);

	// handles setting of options for the chat bot
	const [botOptions, setBotOptions] = useState<Options>({});

	// handles messages between user and the chat bot
	const [messages, setMessages] = useState<Message[]>([]);

	// handles paths of the user
	const [paths, setPaths] = useState<string[]>([]);

	// provides a default welcome flow if no user flow provided
	const parsedFlow: Flow = flow ?? defaultFlow;

	// load options on start
	useEffect(() => {
		loadOptions()
	}, []);

	/**
	 * Loads bot options.
	 */
	const loadOptions = async () => {
		const combinedOptions = await parseBotOptions(options, themes);
		setBotOptions(combinedOptions);
		setOptionsLoaded(true);
	}

	/**
	 * Wraps bot options provider around child element.
	 * 
	 * @param children child element to wrap around
	 */
	const wrapBotOptionsProvider = (children: JSX.Element) => {
		return (
			<BotOptionsContext.Provider value={{botOptions, setBotOptions}}>
				{children}
			</BotOptionsContext.Provider>
		);
	};

	/**
	 * Wraps paths provider around child element.
	 * 
	 * @param children child element to wrap around
	 */
	const wrapPathsProvider = (children: JSX.Element) => {
		return (
			<PathsContext.Provider value={{paths, setPaths}}>
				{children}
			</PathsContext.Provider>
		);
	};

	/**
	 * Wraps messages provider around child element.
	 * 
	 * @param children child element to wrap around
	 */
	const wrapMessagesProvider = (children: JSX.Element) => {
		return (
			<MessagesContext.Provider value={{messages, setMessages}}>
				{children}
			</MessagesContext.Provider>
		);
	};

	/**
	 * Renders chatbot with providers based on given options.
	 */
	const renderChatBot = () => {
		let result = <ChatBotContainer flow={parsedFlow}/>;
		if (!botOptions.advance?.useCustomMessages) {
			result = wrapMessagesProvider(result);
		}

		if (!botOptions.advance?.useCustomPaths) {
			result = wrapPathsProvider(result);
		}

		if (!botOptions.advance?.useCustomBotOptions) {
			result = wrapBotOptionsProvider(result);
		}

		return result;
	}

	/**
	 * Checks if chatbot should be shown depending on platform.
	 */
	const shouldShowChatBot = () => {
		return optionsLoaded && (isDesktop && botOptions.theme?.desktopEnabled)
			|| (!isDesktop && botOptions.theme?.mobileEnabled);
	}

	return (
		<>
			{shouldShowChatBot() &&
				<div style={{fontFamily: botOptions.theme?.fontFamily}}>
					{renderChatBot()}
				</div>
			}
		</>
	);
};

export default ChatBot;