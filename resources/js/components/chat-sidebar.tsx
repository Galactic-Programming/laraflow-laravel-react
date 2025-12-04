import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for Chat Contact
export interface ChatContact {
    id: string;
    name: string;
    avatarSrc?: string;
    lastMessage: string;
    timestamp: string;
    hasUnread: boolean;
}

// Types for Tab configuration
export interface ChatTab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

// Props for the internal ChatContactItem component
interface ChatContactItemProps extends ChatContact {
    isActive: boolean;
    onClick: (id: string) => void;
}

// Props for the ChatSidebar component
export interface ChatSidebarProps {
    /** Title displayed at the top of the sidebar */
    title?: string;
    /** List of chat contacts to display */
    contacts: ChatContact[];
    /** Currently active/selected chat ID */
    activeChatId?: string;
    /** Callback when a contact is clicked */
    onContactClick?: (id: string) => void;
    /** Currently active tab ID */
    activeTab?: string;
    /** Callback when tab is changed */
    onTabChange?: (tabId: string) => void;
    /** Custom tabs configuration (defaults to Personal/Groups) */
    tabs?: ChatTab[];
    /** Whether to show the tab switcher */
    showTabs?: boolean;
    /** Whether to show the search icon */
    showSearch?: boolean;
    /** Callback when search icon is clicked */
    onSearchClick?: () => void;
    /** Text for the new chat button */
    newChatButtonText?: string;
    /** Whether to show the new chat button */
    showNewChatButton?: boolean;
    /** Callback when new chat button is clicked */
    onNewChatClick?: () => void;
    /** Additional className for the container */
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Empty state message when no contacts */
    emptyMessage?: string;
}

// Default tabs configuration
const defaultTabs: ChatTab[] = [
    { id: "personal", label: "Personal", icon: <User className="mr-2 h-4 w-4" /> },
    { id: "groups", label: "Groups", icon: <Users className="mr-2 h-4 w-4" /> }
];

// Internal component for rendering a single contact
const ChatContactItem = ({
    id,
    name,
    avatarSrc,
    lastMessage,
    timestamp,
    hasUnread,
    isActive,
    onClick
}: ChatContactItemProps) => (
    <div
        className={cn(
            "hover:bg-muted flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors",
            isActive && "bg-muted"
        )}
        onClick={() => onClick(id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onClick(id)}
    >
        <Avatar>
            <AvatarImage src={avatarSrc} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <span className="font-medium truncate">{name}</span>
                <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">{timestamp}</span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between text-sm">
                <p className="truncate">{lastMessage}</p>
                {hasUnread && <div className="ml-2 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
            </div>
        </div>
    </div>
);

export function ChatSidebar({
    title = "Chat",
    contacts,
    activeChatId,
    onContactClick,
    activeTab,
    onTabChange,
    tabs = defaultTabs,
    showTabs = true,
    showSearch = true,
    onSearchClick,
    newChatButtonText = "New chat",
    showNewChatButton = true,
    onNewChatClick,
    className,
    isLoading = false,
    emptyMessage = "No conversations yet"
}: ChatSidebarProps) {
    return (
        <div className={cn("flex w-80 flex-col border border-r p-4", className)}>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">{title}</h1>
                {showSearch && (
                    <Search
                        className="text-muted-foreground h-5 w-5 cursor-pointer hover:text-foreground transition-colors"
                        onClick={onSearchClick}
                        role="button"
                        tabIndex={0}
                    />
                )}
            </div>

            {/* Tab Switcher */}
            {showTabs && tabs.length > 0 && (
                <div className="mb-6 flex rounded-lg border p-1">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant="ghost"
                            className={cn(
                                "h-9 flex-1 rounded-md text-sm font-medium",
                                activeTab === tab.id
                                    ? "shadow-sm"
                                    : "text-muted-foreground hover:bg-transparent"
                            )}
                            onClick={() => onTabChange?.(tab.id)}
                        >
                            {tab.icon}
                            {tab.label}
                        </Button>
                    ))}
                </div>
            )}

            {/* Contact List */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 animate-pulse">
                            <div className="h-10 w-10 rounded-full bg-muted" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-24 rounded bg-muted" />
                                <div className="h-3 w-32 rounded bg-muted" />
                            </div>
                        </div>
                    ))
                ) : contacts.length === 0 ? (
                    // Empty state
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <User className="h-12 w-12 mb-2 opacity-50" />
                        <p className="text-sm">{emptyMessage}</p>
                    </div>
                ) : (
                    // Contact list
                    contacts.map((contact) => (
                        <ChatContactItem
                            key={contact.id}
                            {...contact}
                            isActive={contact.id === activeChatId}
                            onClick={(id) => onContactClick?.(id)}
                        />
                    ))
                )}
            </div>

            {/* New Chat Button */}
            {showNewChatButton && (
                <div className="mt-6">
                    <Button className="w-full" onClick={onNewChatClick}>
                        {newChatButtonText}
                    </Button>
                </div>
            )}
        </div>
    );
}
