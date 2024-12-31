export type SlideId = 'active-days' | 'contributions-by-day' | 'contributions-by-type' | 'languages' | 'top-repos';
export type SlideType = 'blue' | 'orange' | 'green' | 'purple' | 'gold';

export interface SlideConfig {
  id: SlideId;
  title: string;
  type: SlideType;
}

export const slides: SlideConfig[] = [
  {
    id: 'active-days',
    title: 'Active Days',
    type: 'blue',
  },
  {
    id: 'contributions-by-day',
    title: 'Daily Activity',
    type: 'green',
  },
  {
    id: 'contributions-by-type',
    title: 'Activity Types',
    type: 'orange',
  },
  {
    id: 'languages',
    title: 'Top Languages',
    type: 'purple',
  },
  {
    id: 'top-repos',
    title: 'Top Repositories',
    type: 'gold',
  },
]; 