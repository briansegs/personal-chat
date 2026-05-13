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

type ChatSidebarProps = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  createNewSession: () => void;
};

export function ChatSidebar({
  sessions,
  activeSessionId,
  setActiveSessionId,
  createNewSession,
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
              <Button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                variant="secondary"
                className={`text-left p-2 rounded-lg ${
                  session.id === activeSessionId
                    ? "bg-muted-foreground/50 hover:bg-muted-foreground/30"
                    : "hover:bg-secondary/50"
                }`}
              >
                {session.title}
              </Button>
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
