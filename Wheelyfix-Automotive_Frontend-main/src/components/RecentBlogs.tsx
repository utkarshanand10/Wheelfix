// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { ExternalLink, Calendar, User, Play } from "lucide-react";
// import { useState, useEffect } from "react";

// interface Vlog {
//   id: string;
//   title: string;
//   summary: string;
//   thumbnail: string;
//   channel: string;
//   publishDate: string;
//   url: string;
//   duration?: string;
//   views?: string;
// }

// const RecentVlogs = () => {
//   const [vlogs, setVlogs] = useState<Vlog[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Real automotive vlog data - these would typically come from an API
//   const defaultVlogs: Vlog[] = [
//     {
//       id: '1',
//       title: 'Top 5 Car Service Tips Every Owner Should Know',
//       summary: 'Essential maintenance tips to keep your vehicle running smoothly and avoid costly repairs.',
//       thumbnail: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&h=450&fit=crop&crop=center',
//       channel: 'AutoExpert Channel',
//       publishDate: '2024-01-15',
//       url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
//       duration: '12:34',
//       views: '45.2K'
//     },
//     {
//       id: '2',
//       title: 'ADAS Technology: What You Need to Know in 2024',
//       summary: 'Understanding Advanced Driver Assistance Systems and how they\'re changing modern driving.',
//       thumbnail: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=450&fit=crop&crop=center',
//       channel: 'TechAuto Reviews',
//       publishDate: '2024-01-14',
//       url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
//       duration: '18:22',
//       views: '32.1K'
//     },
//     {
//       id: '3',
//       title: 'Ceramic Coating vs Paint Protection Film: The Ultimate Guide',
//       summary: 'Comparing the two most popular paint protection methods for your vehicle.',
//       thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=450&fit=crop&crop=center',
//       channel: 'Car Care Pro',
//       publishDate: '2024-01-13',
//       url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
//       duration: '15:47',
//       views: '28.9K'
//     },
//     {
//       id: '4',
//       title: 'Best Multi-Brand Service Centers in India 2024',
//       summary: 'Discover the top-rated service centers that work on all major car and bike brands.',
//       thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=450&fit=crop&crop=center',
//       channel: 'Auto India',
//       publishDate: '2024-01-12',
//       url: 'https://www.youtube.com/watch?v=1Bix44H1qvY',
//       duration: '22:15',
//       views: '56.7K'
//     },
//     {
//       id: '5',
//       title: 'Startup Stories: How Wheelyfix is Revolutionizing Auto Services',
//       summary: 'An inside look at the innovative startup changing how we think about automotive maintenance.',
//       thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop&crop=center',
//       channel: 'Startup Stories',
//       publishDate: '2024-01-11',
//       url: 'https://www.youtube.com/watch?v=3YxaaGmT_Mk',
//       duration: '25:33',
//       views: '18.4K'
//     },
//     {
//       id: '6',
//       title: 'Complete Car Maintenance Checklist: Monthly vs Yearly',
//       summary: 'A comprehensive maintenance schedule to keep your vehicle in top condition.',
//       thumbnail: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=450&fit=crop&crop=center',
//       channel: 'Mechanic Tips',
//       publishDate: '2024-01-10',
//       url: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4',
//       duration: '19:48',
//       views: '41.3K'
//     }
//   ];

//   useEffect(() => {
//     // Simulate API call delay
//     const timer = setTimeout(() => {
//       setVlogs(defaultVlogs);
//       setLoading(false);
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, []);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffTime = Math.abs(now.getTime() - date.getTime());
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 1) return '1 day ago';
//     if (diffDays < 7) return `${diffDays} days ago`;
//     if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//   };

//   const handleCardClick = (url: string) => {
//     window.open(url, '_blank', 'noopener,noreferrer');
//   };

//   if (loading) {
//     return (
//       <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
//         <div className="container mx-auto px-4">
//           <div className="text-center">
//             <div className="animate-pulse text-lg">Loading recent vlogs...</div>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (!vlogs || vlogs.length === 0) {
//     return (
//       <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
//         <div className="container mx-auto px-4">
//           <div className="text-center">
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Vlogs</h2>
//             <p className="text-gray-600">No vlogs available at the moment. Please check back later.</p>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
//       <div className="container mx-auto px-4">
//         {/* Section Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
//           <div>
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
//               Recent Vlogs
//             </h2>
//             <p className="text-lg text-gray-600">
//               Stay updated with the latest automotive insights and tips
//             </p>
//           </div>
//           <Button 
//             variant="outline" 
//             className="mt-4 md:mt-0 border-accent text-accent hover:bg-accent hover:text-white"
//           >
//             View all vlogs
//           </Button>
//         </div>

//         {/* Vlogs Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {vlogs.map((vlog) => (
//             <Card 
//               key={vlog.id}
//               className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
//               onClick={() => handleCardClick(vlog.url)}
//             >
//               {/* Thumbnail */}
//               <div className="relative aspect-video overflow-hidden">
//                 <img 
//                   src={vlog.thumbnail} 
//                   alt={vlog.title}
//                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                   loading="lazy"
//                 />
//                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
//                 <div className="absolute top-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
//                   {vlog.duration}
//                 </div>
//                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                   <div className="bg-white/90 rounded-full p-3">
//                     <Play className="h-6 w-6 text-gray-900" />
//                   </div>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-6">
//                 {/* Title */}
//                 <h3 className="font-bold text-lg text-gray-900 mb-3 leading-tight line-clamp-2 group-hover:text-accent transition-colors">
//                   {vlog.title}
//                 </h3>

//                 {/* Summary */}
//                 <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
//                   {vlog.summary}
//                 </p>

//                 {/* Meta Information */}
//                 <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
//                   <div className="flex items-center space-x-2">
//                     <User className="h-3 w-3" />
//                     <span>{vlog.channel}</span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <Calendar className="h-3 w-3" />
//                     <span>{formatDate(vlog.publishDate)}</span>
//                   </div>
//                 </div>

//                 {/* Views */}
//                 {vlog.views && (
//                   <div className="text-xs text-gray-500 mb-4">
//                     {vlog.views} views
//                   </div>
//                 )}

//                 {/* CTA Button */}
//                 <Button 
//                   className="w-full bg-accent hover:bg-accent/90 text-white group-hover:bg-accent/80 transition-colors"
//                   size="sm"
//                 >
//                   Watch vlog →
//                   <ExternalLink className="h-4 w-4 ml-2" />
//                 </Button>
//               </div>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default RecentVlogs;

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, User, Play } from "lucide-react";
import { useState, useEffect } from "react";

interface Vlog {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  channel: string;
  publishDate: string; // ISO yyyy-mm-dd
  url: string;
  duration?: string;
  views?: string;
}

// Keep static data outside the component (perf + lint)
const DEFAULT_VLOGS: Vlog[] = [
  {
    id: "1",
    title: "Top 5 Car Service Tips Every Owner Should Know",
    summary:
      "Essential maintenance tips to keep your vehicle running smoothly and avoid costly repairs.",
    thumbnail:
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&h=450&fit=crop&crop=center",
    channel: "AutoExpert Channel",
    publishDate: "2024-01-15",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "12:34",
    views: "45.2K",
  },
  {
    id: "2",
    title: "ADAS Technology: What You Need to Know in 2024",
    summary:
      "Understanding Advanced Driver Assistance Systems and how they're changing modern driving.",
    thumbnail:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=450&fit=crop&crop=center",
    channel: "TechAuto Reviews",
    publishDate: "2024-01-14",
    url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    duration: "18:22",
    views: "32.1K",
  },
  {
    id: "3",
    title: "Ceramic Coating vs Paint Protection Film: The Ultimate Guide",
    summary:
      "Comparing the two most popular paint protection methods for your vehicle.",
    thumbnail:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=450&fit=crop&crop=center",
    channel: "Car Care Pro",
    publishDate: "2024-01-13",
    url: "https://www.youtube.com/watch?v=JGwWNGJdvx8",
    duration: "15:47",
    views: "28.9K",
  },
  {
    id: "4",
    title: "Best Multi-Brand Service Centers in India 2024",
    summary:
      "Discover the top-rated service centers that work on all major car and bike brands.",
    thumbnail:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=450&fit=crop&crop=center",
    channel: "Auto India",
    publishDate: "2024-01-12",
    url: "https://www.youtube.com/watch?v=1Bix44H1qvY",
    duration: "22:15",
    views: "56.7K",
  },
  {
    id: "5",
    title: "Startup Stories: How Wheelyfix is Revolutionizing Auto Services",
    summary:
      "An inside look at the innovative startup changing how we think about automotive maintenance.",
    thumbnail:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop&crop=center",
    channel: "Startup Stories",
    publishDate: "2024-01-11",
    url: "https://www.youtube.com/watch?v=3YxaaGmT_Mk",
    duration: "25:33",
    views: "18.4K",
  },
  {
    id: "6",
    title: "Complete Car Maintenance Checklist: Monthly vs Yearly",
    summary:
      "A comprehensive maintenance schedule to keep your vehicle in top condition.",
    thumbnail:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=450&fit=crop&crop=center",
    channel: "Mechanic Tips",
    publishDate: "2024-01-10",
    url: "https://www.youtube.com/watch?v=ZZ5LpwO-An4",
    duration: "19:48",
    views: "41.3K",
  },
];

const RecentVlogs = () => {
  const [vlogs, setVlogs] = useState<Vlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setVlogs(DEFAULT_VLOGS);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleCardClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse text-lg">Loading recent vlogs...</div>
          </div>
        </div>
      </section>
    );
  }

  if (!vlogs || vlogs.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recent Vlogs
            </h2>
            <p className="text-gray-600">
              No vlogs available at the moment. Please check back later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Recent Vlogs
            </h2>
            <p className="text-lg text-gray-600">
              Stay updated with the latest automotive insights and tips
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-4 md:mt-0 border-accent text-accent hover:bg-accent hover:text-white"
          >
            View all vlogs
          </Button>
        </div>

        {/* Vlogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vlogs.map((vlog) => (
            <Card
              key={vlog.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
              onClick={() => handleCardClick(vlog.url)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={vlog.thumbnail}
                  alt={vlog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                {vlog.duration && (
                  <div className="absolute top-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {vlog.duration}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 rounded-full p-3">
                    <Play className="h-6 w-6 text-gray-900" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 mb-3 leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                  {vlog.title}
                </h3>

                {/* Summary */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                  {vlog.summary}
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3" />
                    <span>{vlog.channel}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(vlog.publishDate)}</span>
                  </div>
                </div>

                {/* Views */}
                {vlog.views && (
                  <div className="text-xs text-gray-500 mb-4">
                    {vlog.views} views
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  type="button"
                  className="w-full bg-accent hover:bg-accent/90 text-white group-hover:bg-accent/80 transition-colors"
                >
                  Watch vlog →
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentVlogs;
