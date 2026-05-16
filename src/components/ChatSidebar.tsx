import { ChatSession } from "@/app/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { PlusIcon } from "@phosphor-icons/react";
import { Separator } from "./ui/separator";

import { DeleteChatDialog } from "./DeleteChatDialog";

import { useState } from "react";

type ChatSidebarProps = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  createNewSession: () => void;
  deleteSession: (id: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  focusTextarea: () => void;
};

export function ChatSidebar({
  sessions,
  activeSessionId,
  setActiveSessionId,
  createNewSession,
  deleteSession,
  renameSession,
  focusTextarea,
}: ChatSidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const [draftTitle, setDraftTitle] = useState("");

  return (
    <Sidebar>
      <div className="h-24" />
      <SidebarContent>
        <SidebarGroup>
          <Button
            onClick={() => {
              createNewSession();

              requestAnimationFrame(() => {
                focusTextarea();
              });
            }}
          >
            New Session <PlusIcon />
          </Button>
        </SidebarGroup>
        <Separator />
        <SidebarGroup>
          <div className="flex flex-col gap-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between gap-1"
              >
                {editingSessionId === session.id ? (
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={() => {
                      renameSession(session.id, draftTitle);
                      setEditingSessionId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        renameSession(session.id, draftTitle);
                        setEditingSessionId(null);
                      }

                      if (e.key === "Escape") {
                        setEditingSessionId(null);
                      }
                    }}
                    className="border outline-0 p-2 text-sm w-52 bg-muted-foreground/20"
                  />
                ) : (
                  <Button
                    onClick={() => {
                      setActiveSessionId(session.id);
                    }}
                    onDoubleClick={() => {
                      setEditingSessionId(session.id);
                      setDraftTitle(session.title);
                    }}
                    variant="outline"
                    className={`text-left normal-case font-normal p-2 w-48 min-w-0 truncate flex-1 ${
                      session.id === activeSessionId
                        ? "bg-muted-foreground/40 hover:bg-muted-foreground/20"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <span className="truncate">{session.title}</span>
                  </Button>
                )}

                <DeleteChatDialog
                  deleteSession={deleteSession}
                  session={session}
                />
              </div>
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
