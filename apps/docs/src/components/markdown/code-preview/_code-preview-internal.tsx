import { PUBLIC_SITE_URL } from "astro:env/client";
import { Loader2Icon } from "lucide-react";
import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

import { OpenInV0Button } from "@/components/open-in-v0-button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";

export type Demo = string;

// Pre-load all example files at build time
const exampleModules = import.meta.glob("../../../registry/examples/**/*.tsx", { eager: false });

interface CodePreviewInternalProps {
    demo: Demo;
    children: ReactNode;
}

export function CodePreviewInternal({ demo, children }: CodePreviewInternalProps) {
    // demo = "effects/repeating-zoom/basic"
    const parts = demo.split("/");
    const componentName = parts[1] ?? ""; // "repeating-zoom"

    const Component = getComponent(demo);

    return (
        <TooltipProvider>
            <Tabs defaultValue="preview" className="not-content">
                <TabsList className="w-full mb-2" variant="line">
                    <TabsTrigger value="preview" className="grow-0">
                        Preview
                    </TabsTrigger>
                    <TabsTrigger value="code" className="grow-0">
                        Code
                    </TabsTrigger>
                    <OpenInV0Button
                        url={`${PUBLIC_SITE_URL}/r/${componentName}.json`}
                        className="ml-auto"
                    />
                </TabsList>

                {/* Preview Tab - No Card wrapper, no border/padding */}
                <TabsContent
                    value="preview"
                    className="flex h-112.5 items-center justify-center p-0"
                >
                    <Suspense fallback={<Loader2Icon className="size-16 animate-spin" />}>
                        <Component />
                    </Suspense>
                </TabsContent>

                {/* Code Tab - Has Card wrapper with border/padding */}
                <TabsContent value="code" className="h-full">
                    <Card className="no-scrollbar h-112.5 overflow-y-auto rounded-lg bg-transparent p-0">
                        <CardContent className="h-full p-0">{children}</CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </TooltipProvider>
    );
}

// Define the type for the module (using object instead of any)
type ModuleType = {
    default?: ComponentType<object>;
    [key: string]: unknown;
};

function getComponent(fullPath: string) {
    return lazy(async () => {
        // fullPath = "effects/repeating-zoom/basic"
        const modulePath = `../../../registry/examples/${fullPath}.tsx`;

        // Find the matching module from the pre-loaded glob
        const moduleLoader = exampleModules[modulePath] as (() => Promise<ModuleType>) | undefined;

        if (!moduleLoader) {
            console.error(`Example not found: ${modulePath}`);
            console.error(`Available paths:`, Object.keys(exampleModules));
            // Always return a valid component
            return {
                default: (() => <div>Example not found: {fullPath}</div>) as ComponentType<object>,
            };
        }

        // Now TypeScript knows module is ModuleType
        const module = await moduleLoader();
        const namedExport = Object.keys(module).find(
            (key) => typeof module[key] === "function" && key !== "default",
        );

        // Ensure we always have a valid component
        const Component =
            module.default ?? (namedExport ? (module[namedExport] as ComponentType<object>) : null);

        if (!Component) {
            console.error(`No valid component found in: ${modulePath}`);
            return {
                default: (() => (
                    <div>No component exported: {fullPath}</div>
                )) as ComponentType<object>,
            };
        }

        return { default: Component };
    });
}
