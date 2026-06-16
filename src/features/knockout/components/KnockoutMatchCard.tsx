import { Lock, MapPin } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { KnockoutMatchPreview } from "../types/knockout.types";
import { formatKnockoutDateTime } from "../utils/knockout-formatters";

type KnockoutMatchCardProps = {
  match: KnockoutMatchPreview;
};

export function KnockoutMatchCard({ match }: KnockoutMatchCardProps) {
  return (
    <Card className="border-0 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {match.match_code}
            </p>
            <p className="mt-1 text-sm font-medium text-primary">
              {match.round_label}
            </p>
          </div>

          <Badge variant="secondary" className="rounded-full">
            Zablokowane
          </Badge>
        </div>

        <div className="rounded-3xl bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-heading text-2xl">
              {formatKnockoutDateTime(match.kickoff_time)}
            </p>

            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {match.venue_label}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="rounded-3xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Slot 1
            </p>
            <p className="mt-2 font-heading text-2xl">
              {match.home_slot_label}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              vs
            </p>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="rounded-3xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Slot 2
            </p>
            <p className="mt-2 font-heading text-2xl">
              {match.away_slot_label}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Status typu
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Czekamy na koniec grup. Jeszcze nie czas na panikę.
                </p>
              </div>

              <p className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                Wkrótce
              </p>
            </div>
          </div>
        </div>

        <Button
          disabled
          variant="outline"
          className="mt-6 w-full rounded-full bg-white"
        >
          Typowanie po grupach
        </Button>
      </CardContent>
    </Card>
  );
}
