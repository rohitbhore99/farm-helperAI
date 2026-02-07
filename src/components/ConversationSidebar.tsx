import { useState, useEffect } from "react";
import { format } from "date-fns";
import { MessageSquare, Trash2, Plus, LogOut, Menu, X, Sprout, Moon, Sun, Pencil, Check, Settings, Search, MoreVertical, Share2, Download, Pin, Archive, ArchiveRestore, FileText, CheckSquare, Square } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/hooks/useConversations";

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
  onSignOut: () => void;
  onRename: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  onShare: () => void;
  onDownload: () => void;
  onExportPDF: () => void;
  onPin: (id: string, isPinned: boolean) => void;
  onArchive: (id: string, isArchived: boolean) => void;
  userName?: string;
}

const ConversationSidebar = ({
  conversations,
  currentConversationId,
  isOpen,
  onToggle,
  onSelect,
  onNewChat,
  onDelete,
  onSignOut,
  onRename,
  onOpenSettings,
  onShare,
  onDownload,
  onExportPDF,
  onPin,
  onArchive,
  userName,
}: ConversationSidebarProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isResizing, setIsResizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      setSidebarWidth(Math.max(240, Math.min(480, e.clientX)));
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };
  }, [isResizing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDeleteId(null);
      }
    };

    if (deleteId) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteId]);

  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpenId(null);
    };
    if (menuOpenId) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [menuOpenId]);

  const filteredConversations = conversations
    .filter((conv) => !!conv.is_archived === showArchived)
    .filter((conv) => (conv.title || "").toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.is_pinned === b.is_pinned) return 0;
      return a.is_pinned ? -1 : 1;
    });

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => onDelete(id));
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkArchive = () => {
    selectedIds.forEach((id) => onArchive(id, showArchived));
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-card rounded-lg border border-border shadow-sm"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-card border-r border-border flex flex-col transform transition-transform duration-200 relative overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Sidebar Background Pattern */}
        <div 
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
          }}
        />
        <div className="relative z-10 flex flex-col h-full w-full">
        {/* Header */}
        {isSelectionMode ? (
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }}>
                  <X size={20} />
                </Button>
                <span className="font-medium">{selectedIds.size} Selected</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
                if (selectedIds.size === filteredConversations.length) {
                  setSelectedIds(new Set());
                } else {
                  setSelectedIds(new Set(filteredConversations.map(c => c.id)));
                }
              }} title="Select All">
                <CheckSquare size={20} className={selectedIds.size === filteredConversations.length && filteredConversations.length > 0 ? "text-primary" : "text-muted-foreground"} />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                className="flex-1 h-9 text-xs" 
                disabled={selectedIds.size === 0} 
                onClick={() => setShowBulkDeleteConfirm(true)}
              >
                <Trash2 size={14} className="mr-2" /> Delete
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 h-9 text-xs" 
                disabled={selectedIds.size === 0} 
                onClick={handleBulkArchive}
              >
                {showArchived ? <ArchiveRestore size={14} className="mr-2" /> : <Archive size={14} className="mr-2" />}
                {showArchived ? "Unarchive" : "Archive"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Sprout className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">Farm Helper AI</h1>
                <p className="text-xs text-muted-foreground">Farming Assistant</p>
              </div>
            </div>
            <Button
              onClick={onNewChat}
              className="w-full rounded-xl"
              variant="default"
            >
              <Plus size={18} className="mr-2" />
              New Chat
            </Button>

            {/* Search Bar */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/50 border border-input rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              />
            </div>

            {/* Archive Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground justify-between"
            >
              <span>{showArchived ? "Back to Chats" : "Archived Chats"}</span>
              <Archive size={14} />
            </Button>
          </div>
        )}

        {/* Conversations list */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                {searchQuery ? "Search Results" : (showArchived ? "Archived" : "Your Conversations")}
              </p>
              {!isSelectionMode && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsSelectionMode(true)} title="Select Conversations">
                  <CheckSquare size={14} className="text-muted-foreground" />
                </Button>
              )}
            </div>
            {filteredConversations.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-4 text-center">
                {searchQuery ? "No matching conversations found" : "No conversations yet. Start a new chat!"}
              </p>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors ${
                      currentConversationId === conv.id && !isSelectionMode
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground"
                    } ${isSelectionMode && selectedIds.has(conv.id) ? "bg-muted" : ""}`}
                    onClick={() => {
                      if (isSelectionMode) {
                        toggleSelection(conv.id);
                      } else {
                        onSelect(conv.id);
                      }
                    }}
                  >
                    {isSelectionMode ? (
                      <div className={`flex-shrink-0 mr-1 ${selectedIds.has(conv.id) ? "text-primary" : "text-muted-foreground"}`}>
                        {selectedIds.has(conv.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                    ) : (
                      conv.is_pinned ? 
                        <Pin size={16} className="flex-shrink-0 text-primary fill-primary/20" /> : 
                        <MessageSquare size={16} className="flex-shrink-0" />
                    )}
                    {editingId === conv.id ? (
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <input
                          autoFocus
                          className="flex-1 bg-background border border-input rounded px-1 py-0.5 text-sm h-6"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              onRename(conv.id, editTitle);
                              setEditingId(null);
                            }
                            if (e.key === "Escape") {
                              e.stopPropagation();
                              setEditingId(null);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRename(conv.id, editTitle);
                            setEditingId(null);
                          }}
                          className="p-1 hover:bg-muted rounded text-green-600"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium whitespace-normal break-words leading-snug">{conv.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(conv.updated_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                        {!isSelectionMode && <div className={`flex items-center transition-opacity ${currentConversationId === conv.id || menuOpenId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuPosition({ x: rect.right, y: rect.bottom });
                              setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                            }} 
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground" title="Options">
                            <MoreVertical size={16} />
                          </button>
                        </div>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-sm font-medium text-secondary-foreground">
                  {userName?.charAt(0).toUpperCase() || "F"}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                {userName || "Farmer"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSettings}
                className="text-muted-foreground hover:text-foreground"
                title="Settings"
              >
                <Settings size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground"
                title="Toggle theme"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSignOut}
                className="text-muted-foreground hover:text-foreground"
                title="Sign out"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
        </div>

        {/* Resize Handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 hover:bg-primary/20 cursor-col-resize z-50 transition-colors hidden lg:block"
          onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
        />
      </aside>

      {/* Context Menu */}
      {menuOpenId && menuPosition && (
        <div 
          className="fixed z-50 w-40 bg-card border border-border rounded-lg shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            top: Math.min(menuPosition.y, window.innerHeight - 200), 
            left: Math.min(menuPosition.x - 140, window.innerWidth - 170) 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {currentConversationId === menuOpenId && (
            <>
              <button onClick={() => { onShare(); setMenuOpenId(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2">
                <Share2 size={14} /> Share
              </button>
              <button onClick={() => { onDownload(); setMenuOpenId(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2" title="Download as Text">
                <Download size={14} /> Download TXT
              </button>
              <button onClick={() => { onExportPDF(); setMenuOpenId(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2" title="Export as PDF">
                <FileText size={14} /> Export PDF
              </button>
              <div className="h-px bg-border my-1" />
            </>
          )}
          <button 
            onClick={() => { onPin(menuOpenId, conversations.find(c => c.id === menuOpenId)?.is_pinned || false); setMenuOpenId(null); }} 
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
          >
            <Pin size={14} /> {conversations.find(c => c.id === menuOpenId)?.is_pinned ? "Unpin" : "Pin"}
          </button>
          <button 
            onClick={() => { onArchive(menuOpenId, conversations.find(c => c.id === menuOpenId)?.is_archived || false); setMenuOpenId(null); }} 
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
          >
            {conversations.find(c => c.id === menuOpenId)?.is_archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            {conversations.find(c => c.id === menuOpenId)?.is_archived ? "Unarchive" : "Archive"}
          </button>
          <div className="h-px bg-border my-1" />
          <button 
            onClick={() => { 
              setEditingId(menuOpenId); 
              setEditTitle(conversations.find(c => c.id === menuOpenId)?.title || ""); 
              setMenuOpenId(null); 
            }} 
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
          >
            <Pencil size={14} /> Rename
          </button>
          <button 
            onClick={() => { setDeleteId(menuOpenId); setMenuOpenId(null); }} 
            className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setDeleteId(null)}
        >
          <div
            className="bg-card border border-border shadow-lg rounded-xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg text-foreground">Delete Conversation</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  if (deleteId) onDelete(deleteId);
                  setDeleteId(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowBulkDeleteConfirm(false)}
        >
          <div
            className="bg-card border border-border shadow-lg rounded-xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg text-foreground">Delete {selectedIds.size} Conversations?</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete these conversations? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowBulkDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleBulkDelete}>
                Delete All
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConversationSidebar;
