import { PredictionsSkeleton } from "./predictions-skeleton";

export default function PredictionsLoading() {
  return (
    <div className="overflow-y-auto h-full">
      <PredictionsSkeleton />
    </div>
  );
}
