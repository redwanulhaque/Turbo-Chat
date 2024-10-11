import "./sidebar.css";
import { assets } from "../../assets/assets";
import { useContext, useState } from "react";
import { Context } from "../../context/Context";


const Sidebar = () => {

    const [extended, setExtended] = useState(true); // Initially extended
    const { onSent, prevPrompts, setRecentPrompt, newChat } = useContext(Context);

    const loadPreviousPrompt = async (prompt) => { setRecentPrompt(prompt);
        await onSent(prompt);
    };

    return (

        <div className={`sidebar ${extended ? 'extended' : 'collapsed'}`}>

            <div className="top">

                <img src={assets.menu_icon} className="menu" alt="menu-icon" onClick={() => setExtended(prev => !prev)}/>
				
                <div className="new-chat" onClick={newChat}>
                    <img src={assets.plus_icon} alt=""/>
                    {extended ? <p>New Chat</p> : null}
                </div>

                {extended && (

                    <div className="recent">

                        <p className="recent-title">Recent</p>
                        {prevPrompts.map((item, index) => (
                            
                            <div
                                onClick={() => loadPreviousPrompt(item)}
                                className="recent-entry"
                                key={index}
                            >
                                <img src={assets.message_icon} alt="" />
                                <p>{item.slice(0, 30)}</p>
                            </div>
                        ))}

                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
