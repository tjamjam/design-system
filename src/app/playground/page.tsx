"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeSwitcher } from "@/components/theme-switcher";

type Status = "active" | "paused" | "failed" | "draft";

type Pipeline = {
  id: string;
  name: string;
  owner: string;
  region: string;
  status: Status;
  throughput: string;
  lastRun: string;
};

const pipelines: Pipeline[] = [
  { id: "PIP-2041", name: "nightly-user-export", owner: "erin.walsh", region: "us-east-1", status: "active", throughput: "12.4k/s", lastRun: "2 min ago" },
  { id: "PIP-2042", name: "invoice-reconcile", owner: "aaron.kim", region: "us-west-2", status: "active", throughput: "3.1k/s", lastRun: "4 min ago" },
  { id: "PIP-2043", name: "clickstream-agg", owner: "tanya.rhodes", region: "eu-central-1", status: "paused", throughput: "0/s", lastRun: "17 min ago" },
  { id: "PIP-2044", name: "webhook-replay", owner: "marcus.lee", region: "us-east-1", status: "failed", throughput: "0/s", lastRun: "1 hr ago" },
  { id: "PIP-2045", name: "partner-sync", owner: "erin.walsh", region: "us-east-1", status: "active", throughput: "940/s", lastRun: "6 min ago" },
  { id: "PIP-2046", name: "kyc-reverify", owner: "priya.mehta", region: "ap-south-1", status: "draft", throughput: "--", lastRun: "never" },
  { id: "PIP-2047", name: "sftp-inbox-poll", owner: "aaron.kim", region: "us-west-2", status: "active", throughput: "82/s", lastRun: "just now" },
  { id: "PIP-2048", name: "fraud-score-batch", owner: "jesse.park", region: "us-east-1", status: "active", throughput: "6.0k/s", lastRun: "3 min ago" },
  { id: "PIP-2049", name: "data-lake-vacuum", owner: "tanya.rhodes", region: "eu-central-1", status: "paused", throughput: "0/s", lastRun: "1 day ago" },
  { id: "PIP-2050", name: "finops-rollup", owner: "marcus.lee", region: "us-east-1", status: "active", throughput: "210/s", lastRun: "12 min ago" },
  { id: "PIP-2051", name: "ml-feature-store", owner: "priya.mehta", region: "ap-south-1", status: "failed", throughput: "0/s", lastRun: "38 min ago" },
  { id: "PIP-2052", name: "audit-archive", owner: "erin.walsh", region: "us-east-1", status: "active", throughput: "44/s", lastRun: "9 min ago" },
];

const statusStyles: Record<Status, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-[var(--success-bg)] text-[var(--success-fg)]",
  },
  paused: {
    label: "Paused",
    className: "bg-muted text-muted-foreground",
  },
  failed: {
    label: "Failed",
    className: "bg-[var(--destructive-bg)] text-[var(--destructive-fg)]",
  },
  draft: {
    label: "Draft",
    className: "bg-[var(--info-bg)] text-[var(--info-fg)]",
  },
};

const stats = [
  { label: "Throughput (p50)", value: "23.4k/s", delta: "+4.2%", positive: true },
  { label: "Error rate", value: "0.42%", delta: "-0.08%", positive: true },
  { label: "Active pipelines", value: "48", delta: "+3", positive: true },
  { label: "Failed runs (24h)", value: "9", delta: "+2", positive: false },
];

const columns: ColumnDef<Pipeline>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.id}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "owner",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Owner" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.owner}</span>
    ),
  },
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.region}</span>
    ),
    filterFn: "equals",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = statusStyles[row.original.status];
      return <Badge className={s.className}>{s.label}</Badge>;
    },
    filterFn: "equals",
  },
  {
    accessorKey: "throughput",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Throughput"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <span className="text-right tabular-nums">{row.original.throughput}</span>
    ),
  },
  {
    accessorKey: "lastRun",
    header: "Last run",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.lastRun}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions pipeline={row.original} />,
    enableHiding: false,
    size: 40,
  },
];

export default function PlaygroundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={
                <Link href="/">
                  <ArrowLeft className="size-4" /> Home
                </Link>
              }
            />
            <span className="font-heading text-lg font-semibold">
              Ingest / Pipelines
            </span>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Pipelines
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor ingestion pipelines across regions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="size-4" /> Export
            </Button>
            <NewPipelineDialog />
          </div>
        </div>

        <section className="grid grid-cols-2 gap-4 pb-6 md:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {s.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span
                  className={
                    s.positive
                      ? "inline-flex items-center gap-1 text-sm text-[var(--success-fg)]"
                      : "inline-flex items-center gap-1 text-sm text-[var(--destructive-fg)]"
                  }
                >
                  <ArrowUpRight className="size-3.5" /> {s.delta}
                </span>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>All pipelines</CardTitle>
            <CardDescription>
              Search, sort, and filter. Select rows for bulk actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={pipelines}
              searchKey="name"
              searchPlaceholder="Search by name"
              selectable
              pageSize={8}
              toolbar={(table) => (
                <>
                  <Select
                    value={
                      (table.getColumn("region")?.getFilterValue() as string) ?? ""
                    }
                    onValueChange={(v) => {
                      const col = table.getColumn("region");
                      col?.setFilterValue(v && v !== "__all" ? v : undefined);
                    }}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All regions</SelectItem>
                      <SelectItem value="us-east-1">us-east-1</SelectItem>
                      <SelectItem value="us-west-2">us-west-2</SelectItem>
                      <SelectItem value="eu-central-1">eu-central-1</SelectItem>
                      <SelectItem value="ap-south-1">ap-south-1</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={
                      (table.getColumn("status")?.getFilterValue() as string) ?? ""
                    }
                    onValueChange={(v) => {
                      const col = table.getColumn("status");
                      col?.setFilterValue(v && v !== "__all" ? v : undefined);
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function RowActions({ pipeline }: { pipeline: Pipeline }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={`Actions for ${pipeline.name}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem>View run history</DropdownMenuItem>
        <DropdownMenuItem>Edit configuration</DropdownMenuItem>
        <DropdownMenuItem>Pause pipeline</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NewPipelineDialog() {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" /> New pipeline
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New pipeline</DialogTitle>
          <DialogDescription>
            Create a new ingest pipeline. You can edit these later.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pipeline-name">Name</Label>
            <Input id="pipeline-name" placeholder="my-new-pipeline" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pipeline-region">Region</Label>
            <Select defaultValue="us-east-1">
              <SelectTrigger id="pipeline-region">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us-east-1">us-east-1</SelectItem>
                <SelectItem value="us-west-2">us-west-2</SelectItem>
                <SelectItem value="eu-central-1">eu-central-1</SelectItem>
                <SelectItem value="ap-south-1">ap-south-1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
