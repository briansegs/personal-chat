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

type ChatSidebarProps = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  createNewSession: () => void;
  deleteSession: (id: string) => void;
};

export function ChatSidebar({
  sessions,
  activeSessionId,
  setActiveSessionId,
  createNewSession,
  deleteSession,
}: ChatSidebarProps) {
  return (
    <Sidebar>
      <div className="h-24" />
      <SidebarContent>
        <SidebarGroup>
          <Button onClick={createNewSession}>
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
                <Button
                  onClick={() => setActiveSessionId(session.id)}
                  variant="outline"
                  className={`text-left normal-case font-normal p-2 rounded-lg w-48 min-w-0 truncate flex-1 ${
                    session.id === activeSessionId
                      ? "bg-muted-foreground/40 hover:bg-muted-foreground/30"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  {session.title}
                </Button>

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
