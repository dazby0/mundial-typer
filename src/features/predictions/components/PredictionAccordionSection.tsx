import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MatchListItem,
  MyMatchPrediction,
} from "@/src/features/matches/types/match.types";
import { PredictionChecklistItem } from "./PredictionCheckListItem";

type PredictionAccordionSectionProps = {
  value: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  matches: MatchListItem[];
  predictionsByMatchId: Map<string, MyMatchPrediction>;
};

export function PredictionAccordionSection({
  value,
  title,
  description,
  emptyTitle,
  emptyDescription,
  matches,
  predictionsByMatchId,
}: PredictionAccordionSectionProps) {
  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-[2rem] border-0 bg-white px-6 shadow-sm"
    >
      <AccordionTrigger className="py-6 text-left hover:no-underline">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black">{title}</h2>

            <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold">
              {matches.length}
            </span>
          </div>

          <p className="mt-1 text-sm font-normal text-muted-foreground">
            {description}
          </p>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-6">
        {matches.length === 0 ? (
          <div className="rounded-3xl bg-background p-6">
            <p className="font-bold">{emptyTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyDescription}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <PredictionChecklistItem
                key={match.id}
                match={match}
                prediction={predictionsByMatchId.get(match.id)}
              />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
