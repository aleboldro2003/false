/**
 * False App — Mock / Dummy Data
 */

export interface Post {
    id: string;
    avatar: string;
    username: string;
    handle: string;
    time: string;
    text: string;
    isThread: boolean;
    comments: number;
    reposts: number;
    likes: number;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    likedByMe?: boolean;
    isReposted?: boolean;
    authorId?: string; // Added for navigation to profile
}

export interface Podcast {
    id: string;
    thumbnail: string;
    creatorAvatar: string;
    creatorName: string;
    title: string;
    description: string;
    duration: string;
    durationSeconds?: number;
    views?: string;
    year?: string;
    videoUrl?: string;
    isFavorite?: boolean;
}

export interface UserProfile {
    avatar: string;
    headerImage: string;
    name: string;
    handle: string;
    bio: string;
    followers: number;
    following: number;
    isOwn: boolean;
}

export interface NowPlaying {
    id: string;
    title: string;
    creator: string;
    coverArt: string;
    duration: number;
    elapsed: number;
}

export interface Comment {
    id: string;
    avatar: string;
    username: string;
    handle: string;
    time: string;
    text: string;
}

// ─── Posts ───────────────────────────────────────────────────

export const POSTS: Post[] = [
    {
        id: '1',
        avatar: 'https://i.pravatar.cc/100?img=1',
        username: 'Alex Rivera',
        handle: '@alexrivera',
        time: '2m',
        text: 'Just shipped the new dark mode for our app. The pitch-black background with minimal accents is *chef\'s kiss*. Less is truly more.',
        isThread: false,
        comments: 12,
        reposts: 4,
        likes: 89,
    },
    {
        id: '2',
        avatar: 'https://i.pravatar.cc/100?img=2',
        username: 'Mia Chen',
        handle: '@miachen',
        time: '15m',
        text: 'Hot take: most social media feeds are over-designed. The best UI is the one you don\'t notice. Clean typography, breathing room, and zero noise.',
        isThread: true,
        comments: 45,
        reposts: 23,
        likes: 312,
    },
    {
        id: '2a',
        avatar: 'https://i.pravatar.cc/100?img=2',
        username: 'Mia Chen',
        handle: '@miachen',
        time: '15m',
        text: 'This is why I love apps that use a single accent color. It creates focus and hierarchy without visual clutter.',
        isThread: false,
        comments: 8,
        reposts: 5,
        likes: 67,
    },
    {
        id: '3',
        avatar: 'https://i.pravatar.cc/100?img=3',
        username: 'Jordan Blake',
        handle: '@jordanblake',
        time: '1h',
        text: 'Working on a new podcast series about the intersection of design and technology. Episode 1 drops next week. Stay tuned.',
        isThread: false,
        comments: 7,
        reposts: 2,
        likes: 45,
    },
    {
        id: '4',
        avatar: 'https://i.pravatar.cc/100?img=4',
        username: 'Sam Taylor',
        handle: '@samtaylor',
        time: '2h',
        text: 'The secret to good UI? Padding. Seriously. Give your elements room to breathe and everything looks 10x more premium.',
        isThread: false,
        comments: 19,
        reposts: 11,
        likes: 156,
    },
    {
        id: '5',
        avatar: 'https://i.pravatar.cc/100?img=5',
        username: 'Luna Park',
        handle: '@lunapark',
        time: '3h',
        text: 'Listening to a deep-dive podcast on minimalism in product design. The key takeaway: every pixel should earn its place on the screen.',
        isThread: true,
        comments: 3,
        reposts: 1,
        likes: 28,
    },
    {
        id: '5a',
        avatar: 'https://i.pravatar.cc/100?img=5',
        username: 'Luna Park',
        handle: '@lunapark',
        time: '3h',
        text: 'Also, if you haven\'t tried a fully dark-mode workflow yet, you\'re sleeping on one of the best productivity hacks.',
        isThread: false,
        comments: 14,
        reposts: 6,
        likes: 92,
    },
    {
        id: '6',
        avatar: 'https://i.pravatar.cc/100?img=6',
        username: 'Dev Patel',
        handle: '@devpatel',
        time: '5h',
        text: 'Just recorded a new episode about React Native performance. Spoiler: the bottleneck is almost never where you think it is.',
        isThread: false,
        comments: 31,
        reposts: 17,
        likes: 204,
    },
    {
        id: '7',
        avatar: 'https://i.pravatar.cc/100?img=7',
        username: 'Ava Kim',
        handle: '@avakim',
        time: '8h',
        text: 'Thread: 5 principles that separate good UX from great UX 🧵',
        isThread: true,
        comments: 52,
        reposts: 38,
        likes: 441,
    },
    {
        id: '7a',
        avatar: 'https://i.pravatar.cc/100?img=7',
        username: 'Ava Kim',
        handle: '@avakim',
        time: '8h',
        text: '1. Consistency over cleverness\n2. Performance IS a feature\n3. Reduce cognitive load\n4. Design for the 80% use case\n5. White space is not wasted space',
        isThread: false,
        comments: 19,
        reposts: 12,
        likes: 187,
    },
];

// ─── Podcasts ───────────────────────────────────────────────

export const PODCASTS: Podcast[] = [
    {
        id: 'p1',
        thumbnail: 'https://picsum.photos/seed/pod1/400/225',
        creatorAvatar: 'https://i.pravatar.cc/100?img=8',
        creatorName: 'Design Weekly',
        title: 'THE ART OF MINIMALISM IN UI',
        description: 'Why less truly means more in modern interface design.',
        duration: '42:15',
        views: '1.2M views',
        year: '2026',
    },
    {
        id: 'p2',
        thumbnail: 'https://picsum.photos/seed/pod2/400/225',
        creatorAvatar: 'https://i.pravatar.cc/100?img=9',
        creatorName: 'Tech Deep Dive',
        title: 'REACT NATIVE IN 2026',
        description: 'Breaking down the new architecture and what it means for developers.',
        duration: '1:08:32',
        views: '890K views',
        year: '2026',
    },
    {
        id: 'p3',
        thumbnail: 'https://picsum.photos/seed/pod3/400/225',
        creatorAvatar: 'https://i.pravatar.cc/100?img=10',
        creatorName: 'Startup Stories',
        title: 'FROM ZERO TO SERIES A',
        description: 'How three founders built a product that investors couldn\'t ignore.',
        duration: '55:47',
        views: '2.1M views',
        year: '2025',
    },
    {
        id: 'p4',
        thumbnail: 'https://picsum.photos/seed/pod4/400/225',
        creatorAvatar: 'https://i.pravatar.cc/100?img=11',
        creatorName: 'Code & Coffee',
        title: 'BUILDING BEAUTIFUL DARK UIS',
        description: 'A masterclass on dark mode design systems and contrast ratios.',
        duration: '37:20',
        views: '540K views',
        year: '2026',
    },
    {
        id: 'p5',
        thumbnail: 'https://picsum.photos/seed/pod5/400/225',
        creatorAvatar: 'https://i.pravatar.cc/100?img=12',
        creatorName: 'The Creator Lab',
        title: 'CONTENT CREATION MEETS ENGINEERING',
        description: 'Where storytelling meets software — the future of creator tools.',
        duration: '49:03',
        views: '670K views',
        year: '2025',
    },
    {
        id: 'p6',
        thumbnail: 'https://picsum.photos/seed/pod6/400/225',
        creatorAvatar: 'https://i.pravatar.cc/100?img=13',
        creatorName: 'Sound & Vision',
        title: 'AUDIO-FIRST SOCIAL MEDIA',
        description: 'Why podcasts and voice are the next frontier for social platforms.',
        duration: '1:12:05',
        views: '3.4M views',
        year: '2025',
    },
    {
        id: 'p7',
        thumbnail: 'https://picsum.photos/seed/pod7/400/225',
        creatorAvatar: 'https://i.pravatar.cc/100?img=14',
        creatorName: 'Pixel Perfect',
        title: 'MICRO-ANIMATIONS THAT DELIGHT',
        description: 'The subtle motion design tricks used by top apps.',
        duration: '28:44',
        views: '420K views',
        year: '2026',
    },
];

// ─── Comments (for Post Detail) ─────────────────────────────

export const COMMENTS: Comment[] = [
    {
        id: 'c1',
        avatar: 'https://i.pravatar.cc/100?img=20',
        username: 'Nora Wells',
        handle: '@norawells',
        time: '1m',
        text: 'Couldn\'t agree more. The best interfaces are invisible.',
    },
    {
        id: 'c2',
        avatar: 'https://i.pravatar.cc/100?img=21',
        username: 'Kai Tanaka',
        handle: '@kaitanaka',
        time: '5m',
        text: 'This is exactly why I switched to a dark-mode-first workflow. Game changer.',
    },
    {
        id: 'c3',
        avatar: 'https://i.pravatar.cc/100?img=22',
        username: 'Riley Morgan',
        handle: '@rileymorgan',
        time: '12m',
        text: 'Been saying this for years. Padding and white space are underrated superpowers.',
    },
    {
        id: 'c4',
        avatar: 'https://i.pravatar.cc/100?img=23',
        username: 'Jamie Cruz',
        handle: '@jamiecruz',
        time: '30m',
        text: 'Can you share the color palette? That accent blue is 🔥',
    },
    {
        id: 'c5',
        avatar: 'https://i.pravatar.cc/100?img=24',
        username: 'Morgan Lee',
        handle: '@morganlee',
        time: '1h',
        text: 'Minimalism done right. Most people confuse minimal with empty.',
    },
    {
        id: 'c6',
        avatar: 'https://i.pravatar.cc/100?img=25',
        username: 'Casey Nguyen',
        handle: '@caseynguyen',
        time: '2h',
        text: 'Love the approach. Would be great to see a breakdown of the typography choices too.',
    },
];

// ─── Current User Profile ───────────────────────────────────

export const CURRENT_USER: UserProfile = {
    avatar: 'https://i.pravatar.cc/200?img=15',
    headerImage: 'https://picsum.photos/seed/header/800/300',
    name: 'Marcus Cole',
    handle: '@marcuscole',
    bio: 'Product designer & engineer. Building at the intersection of utility and beauty. Minimalist by conviction.',
    followers: 12400,
    following: 843,
    isOwn: true,
};

// ─── Now Playing ────────────────────────────────────────────

export const NOW_PLAYING: NowPlaying = {
    id: 'p1',
    title: 'The Art of Minimalism in UI',
    creator: 'Design Weekly',
    coverArt: 'https://picsum.photos/seed/pod1/400/400',
    duration: 2535,
    elapsed: 874,
};
