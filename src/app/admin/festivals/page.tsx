import { db } from "@/core/db";
import { festivals } from "@/core/db/schema";
import { FestivalManager } from "@/features/admin/components/FestivalManager";

export default async function AdminFestivalsPage() {
  const allFestivals = await db.select().from(festivals);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <FestivalManager initialFestivals={allFestivals} />
    </div>
  );
}


