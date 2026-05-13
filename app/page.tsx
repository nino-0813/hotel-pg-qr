import FrameSelect from "./FrameSelect";
import PhotoBooth from "./PhotoBooth";
import { frames, isFrameId } from "./frames";

type SearchParams = Promise<{ f?: string }>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  if (isFrameId(params.f)) {
    return <PhotoBooth frame={frames[params.f]} />;
  }
  return <FrameSelect />;
}
