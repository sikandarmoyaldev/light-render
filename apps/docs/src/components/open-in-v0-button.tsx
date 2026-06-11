import { V0Icon } from "@/components/icons/v0-icon";
import { Button } from "@/components/ui/button";

interface OpenInV0ButtonProps {
    url: string;
    className?: string;
}

export function OpenInV0Button({ url, className }: OpenInV0ButtonProps) {
    return (
        <Button aria-label="Open in v0" variant="ghost" asChild className={className}>
            <a href={`https://v0.dev/chat/api/open?url=${url}`} target="_blank" rel="noreferrer">
                Open in <V0Icon />
            </a>
        </Button>
    );
}
