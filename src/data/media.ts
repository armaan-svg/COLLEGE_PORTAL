export type ApprovedVideo = { title: string; description: string; kind: 'youtube' | 'local'; source: string; poster?: string };
export const approvedVideos: ApprovedVideo[] = [];
export const launchMedia = {
  src: '/img/spacex-crew9-launch.jpg',
  title: 'SpaceX Falcon 9 · Crew-9 launch',
  caption: 'Falcon 9 carrying Dragon lifts off from Cape Canaveral, Florida, on 28 September 2024.',
  credit: 'NASA / Ben Smegelsky',
  source: 'https://images.nasa.gov/details/KSC-20240928-PH-JBS01_0044',
};
