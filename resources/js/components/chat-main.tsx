import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowRight, ImageIcon, MoreVertical, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Types for Chat Message
export interface ChatMessage {
    id: string;
    content: string;
    sender: "user" | "other";
    avatarSrc?: string;
    timestamp?: string;
    status?: "sending" | "sent" | "delivered" | "read" | "error";
}

// Types for Chat User (the person you're chatting with)
export interface ChatUser {
    id: string;
    name: string;
    avatarSrc?: string;
    status?: string;
    isOnline?: boolean;
}

// Props for the internal MessageBubble component
interface MessageBubbleProps {
    message: string;
    isUserMessage: boolean;
    avatarSrc?: string;
    timestamp?: string;
    status?: ChatMessage["status"];
    showAvatar?: boolean;
}

// Props for the ChatMain component
export interface ChatMainProps {
    /** The user you're chatting with */
    chatUser?: ChatUser;
    /** List of messages in the conversation */
    messages: ChatMessage[];
    /** Callback when a message is sent */
    onSendMessage?: (message: string) => void;
    /** Callback when the menu icon is clicked */
    onMenuClick?: () => void;
    /** Callback when the attachment icon is clicked */
    onAttachmentClick?: () => void;
    /** Placeholder text for the input */
    inputPlaceholder?: string;
    /** Whether the input is disabled */
    isInputDisabled?: boolean;
    /** Whether messages are loading */
    isLoading?: boolean;
    /** Whether a message is currently being sent */
    isSending?: boolean;
    /** Show attachment button */
    showAttachment?: boolean;
    /** Show header */
    showHeader?: boolean;
    /** Custom empty state message */
    emptyMessage?: string;
    /** Additional className for the container */
    className?: string;
    /** Auto-scroll to bottom on new messages */
    autoScroll?: boolean;
}

// Internal component for rendering a message bubble
const MessageBubble = ({
    message,
    isUserMessage,
    avatarSrc,
    timestamp,
    showAvatar = true
}: MessageBubbleProps) => (
    <div className={cn("flex items-start gap-3", isUserMessage ? "justify-end" : "")}>
        {!isUserMessage && showAvatar && (
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="User Avatar" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
        )}
        {!isUserMessage && !showAvatar && <div className="w-8" />}
        <div
            className={cn(
                "max-w-[70%] rounded-lg p-3",
                isUserMessage
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted rounded-bl-none"
            )}
        >
            <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
            {timestamp && (
                <p className={cn(
                    "text-xs mt-1",
                    isUserMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                    {timestamp}
                </p>
            )}
        </div>
    </div>
);

// Loading skeleton for messages
const MessageSkeleton = ({ isUser = false }: { isUser?: boolean }) => (
    <div className={cn("flex items-start gap-3 animate-pulse", isUser ? "justify-end" : "")}>
        {!isUser && <div className="h-8 w-8 rounded-full bg-muted" />}
        <div className={cn("rounded-lg p-3 space-y-2", isUser ? "bg-primary/20" : "bg-muted")}>
            <div className="h-4 w-48 rounded bg-muted-foreground/20" />
            <div className="h-4 w-32 rounded bg-muted-foreground/20" />
        </div>
    </div>
);

export function ChatMain({
    chatUser,
    messages,
    onSendMessage,
    onMenuClick,
    onAttachmentClick,
    inputPlaceholder = "Enter a message...",
    isInputDisabled = false,
    isLoading = false,
    isSending = false,
    showAttachment = true,
    showHeader = true,
    emptyMessage = "No messages yet. Start a conversation!",
    className,
    autoScroll = true
}: ChatMainProps) {
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (autoScroll && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, autoScroll]);

    const handleSendMessage = () => {
        const trimmedMessage = inputValue.trim();
        if (trimmedMessage && onSendMessage && !isSending) {
            onSendMessage(trimmedMessage);
            setInputValue("");
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={cn("m-4 flex flex-1 flex-col rounded-lg shadow-sm", className)}>
            {/* Header */}
            {showHeader && chatUser && (
                <div className="flex items-center justify-between border border-b p-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={chatUser.avatarSrc || "/placeholder.svg"}
                                    alt={chatUser.name}
                                />
                                <AvatarFallback>{chatUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {chatUser.isOnline && (
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold">{chatUser.name}</h2>
                            {chatUser.status && (
                                <p className="text-muted-foreground text-sm">{chatUser.status}</p>
                            )}
                        </div>
                    </div>
                    <MoreVertical
                        className="text-muted-foreground h-5 w-5 cursor-pointer hover:text-foreground transition-colors"
                        onClick={onMenuClick}
                        role="button"
                        tabIndex={0}
                    />
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {isLoading ? (
                    // Loading skeleton
                    <>
                        <MessageSkeleton />
                        <MessageSkeleton isUser />
                        <MessageSkeleton />
                        <MessageSkeleton isUser />
                    </>
                ) : messages.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
                        <p className="text-sm text-center">{emptyMessage}</p>
                    </div>
                ) : (
                    // Messages list
                    <>
                        {messages.map((msg, index) => {
                            // Show avatar only for first message in a sequence from the same sender
                            const prevMsg = messages[index - 1];
                            const showAvatar = !prevMsg || prevMsg.sender !== msg.sender;

                            return (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg.content}
                                    isUserMessage={msg.sender === "user"}
                                    avatarSrc={msg.avatarSrc}
                                    timestamp={msg.timestamp}
                                    status={msg.status}
                                    showAvatar={showAvatar}
                                />
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="flex items-center gap-3 border border-t p-4">
                {showAttachment && (
                    <ImageIcon
                        className="text-muted-foreground h-5 w-5 cursor-pointer hover:text-foreground transition-colors flex-shrink-0"
                        onClick={onAttachmentClick}
                        role="button"
                        tabIndex={0}
                    />
                )}
                <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={inputPlaceholder}
                    disabled={isInputDisabled || isSending}
                    className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="rounded-full flex-shrink-0"
                    disabled={!inputValue.trim() || isInputDisabled || isSending}
                >
                    <ArrowRight className={cn(isSending && "animate-pulse")} />
                </Button>
            </form>
        </div>
    );
}
