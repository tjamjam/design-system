import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5" />
            <span className="font-heading text-lg font-semibold">design-system</span>
            <Badge variant="secondary" className="ml-2">
              v0
            </Badge>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <section className="flex flex-col gap-6 pb-10">
          <div className="flex flex-col gap-3">
            <Badge variant="outline" className="w-fit">
              Themeable component library
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
              Prototype dense B2B UIs in any brand.
            </h1>
            <p className="max-w-2xl text-muted-foreground md:text-lg">
              Switch the brand, mode, and density above. All components re-render against the new tokens. Built on shadcn, Tailwind v4, and Base UI.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                nativeButton={false}
                render={
                  <Link href="/playground">
                    Open playground <ArrowRight className="size-4" />
                  </Link>
                }
              />
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">
                    shadcn docs
                  </a>
                }
              />
            </div>
          </div>
        </section>

        <Separator />

        <section className="grid gap-6 py-10 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>
                All variants respond to brand + density tokens.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form</CardTitle>
              <CardDescription>
                Typography and control heights shift with density.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="demo-email">Email</Label>
                <Input id="demo-email" placeholder="you@example.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="demo-name">Full name</Label>
                <Input id="demo-name" placeholder="Terrence Fradet" />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
              <CardDescription>
                Compose primitives to build product surfaces quickly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="overview"
                  className="pt-4 text-sm text-muted-foreground"
                >
                  Cycle through brands to see typography and color shift.
                </TabsContent>
                <TabsContent
                  value="activity"
                  className="pt-4 text-sm text-muted-foreground"
                >
                  Radius and borders adjust per brand.
                </TabsContent>
                <TabsContent
                  value="settings"
                  className="pt-4 text-sm text-muted-foreground"
                >
                  Density controls the tab trigger heights.
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-6 text-sm text-muted-foreground">
          Built on Next.js 16, React 19, Tailwind v4, shadcn, Base UI.
        </div>
      </footer>
    </div>
  );
}
