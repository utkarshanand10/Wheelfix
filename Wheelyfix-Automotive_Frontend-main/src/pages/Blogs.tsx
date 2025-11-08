// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Calendar, User, ArrowRight, Search, Clock as ClockIcon, Tag, ChevronLeft, ChevronRight } from "lucide-react";
// import { format } from "date-fns";

// // Define blog post type
// type BlogPost = {
//   id: number;
//   title: string;
//   excerpt: string;
//   image: string;
//   author: string;
//   date: string;
//   category: string;
//   readTime: string;
//   tags?: string[];
//   content?: string;
// };

// const Blogs = () => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [selectedTag, setSelectedTag] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const postsPerPage = 6;
  
//   // Sample blog data with expanded content
//   const blogs: BlogPost[] = [
//     {
//       id: 1,
//       title: "Essential Car Maintenance Tips for Indian Roads",
//       excerpt: "Learn how to keep your car in perfect condition while navigating challenging Indian road conditions.",
//       image: "/placeholder.svg",
//       author: "Rajesh Kumar",
//       date: "2024-01-15",
//       category: "Car Care",
//       readTime: "5 min read",
//       tags: ["maintenance", "car care", "tips"],
//       content: "Detailed content about car maintenance tips..."
//     },
//     {
//       id: 2,
//       title: "Bike Service: When and Why You Need It",
//       excerpt: "Understanding the importance of regular bike servicing and how it extends your vehicle's life.",
//       image: "/placeholder.svg",
//       author: "Priya Sharma",
//       date: "2024-01-12",
//       category: "Bike Care",
//       readTime: "4 min read",
//       tags: ["bike maintenance", "service schedule", "two-wheeler"],
//       content: "Detailed content about bike servicing..."
//     },
//     {
//       id: 3,
//       title: "Top 10 Warning Signs Your Car Needs Immediate Attention",
//       excerpt: "Don't ignore these critical warning signs that indicate your car needs professional service.",
//       image: "/placeholder.svg",
//       author: "Amit Singh",
//       date: "2024-01-10",
//       category: "Car Care",
//       readTime: "6 min read",
//       tags: ["car maintenance", "warning signs", "safety"],
//       content: "Detailed content about warning signs..."
//     },
//     {
//       id: 4,
//       title: "Monsoon Vehicle Care: Protecting Your Ride",
//       excerpt: "Essential tips to protect your vehicle during the monsoon season in India.",
//       image: "/placeholder.svg",
//       author: "Sneha Patel",
//       date: "2024-01-08",
//       category: "Seasonal Care",
//       readTime: "7 min read",
//       tags: ["monsoon care", "seasonal maintenance", "water damage"],
//       content: "Detailed content about monsoon care..."
//     },
//     {
//       id: 5,
//       title: "Electric vs Petrol: Which is Better for Indian Cities?",
//       excerpt: "A comprehensive comparison of electric and petrol vehicles for urban Indian driving.",
//       image: "/placeholder.svg",
//       author: "Vikram Reddy",
//       date: "2024-01-05",
//       category: "Industry News",
//       readTime: "8 min read",
//       tags: ["electric vehicles", "comparison", "sustainability"],
//       content: "Detailed comparison between electric and petrol vehicles..."
//     },
//     {
//       id: 6,
//       title: "DIY Basic Car Maintenance You Can Do at Home",
//       excerpt: "Simple maintenance tasks every car owner can perform to save money and time.",
//       image: "/placeholder.svg",
//       author: "Meera Joshi",
//       date: "2024-01-03",
//       category: "DIY Tips",
//       readTime: "5 min read",
//       tags: ["DIY", "car maintenance", "savings"],
//       content: "Detailed DIY maintenance tips..."
//     },
//     {
//       id: 7,
//       title: "The Future of Electric Vehicles in India",
//       excerpt: "Exploring the growth and challenges of electric vehicles in the Indian market.",
//       image: "/placeholder.svg",
//       author: "Rahul Verma",
//       date: "2024-01-20",
//       category: "Industry News",
//       readTime: "6 min read",
//       tags: ["electric vehicles", "future tech", "sustainability"],
//       content: "Detailed content about EVs in India..."
//     },
//     {
//       id: 8,
//       title: "Winter Car Care: Preparing Your Vehicle for Cold Weather",
//       excerpt: "Essential winter car care tips to keep your vehicle running smoothly in cold conditions.",
//       image: "/placeholder.svg",
//       author: "Anjali Mehta",
//       date: "2024-01-18",
//       category: "Seasonal Care",
//       readTime: "5 min read",
//       tags: ["winter care", "seasonal maintenance", "battery care"],
//       content: "Detailed winter car care tips..."
//     },
//     {
//       id: 9,
//       title: "How to Choose the Right Engine Oil for Your Car",
//       excerpt: "A comprehensive guide to selecting the perfect engine oil for your vehicle's needs.",
//       image: "/placeholder.svg",
//       author: "Vikram Singh",
//       date: "2024-01-16",
//       category: "Car Care",
//       readTime: "7 min read",
//       tags: ["engine oil", "car maintenance", "lubricants"],
//       content: "Detailed guide on engine oil selection..."
//     }
//   ];

//   // Extract all unique categories and tags
//   const categories = ["All", ...new Set(blogs.map(blog => blog.category))];
//   const allTags = Array.from(new Set(blogs.flatMap(blog => blog.tags || [])));
  
//   // Filter and search functionality
//   const filteredBlogs = blogs.filter(blog => {
//     const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                          blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
//     const matchesTag = !selectedTag || (blog.tags && blog.tags.includes(selectedTag));
    
//     return matchesSearch && matchesCategory && matchesTag;
//   });
  
//   // Pagination
//   const indexOfLastPost = currentPage * postsPerPage;
//   const indexOfFirstPost = indexOfLastPost - postsPerPage;
//   const currentPosts = filteredBlogs.slice(indexOfFirstPost, indexOfLastPost);
//   const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);
  
//   const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
//   const handleViewPost = (postId: number) => {
//     navigate(`/blog/${postId}`);
//   };
  
//   // Reset to first page when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedCategory, selectedTag, searchQuery]);

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
      
//       {/* Hero Section with Search */}
//       <div className="bg-gradient-to-r from-primary to-accent text-white py-16">
//         <div className="container mx-auto px-4 text-center">
//           <h1 className="text-4xl md:text-5xl font-bold mb-4">Wheelyfix Blog</h1>
//           <p className="text-xl max-w-3xl mx-auto mb-8">
//             Expert insights, tips, and guides for vehicle maintenance and care
//           </p>
          
//           {/* Search Bar */}
//           <div className="max-w-2xl mx-auto relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//             <Input
//               type="text"
//               placeholder="Search articles..."
//               className="pl-10 pr-4 py-6 text-base rounded-lg shadow-lg border-0 focus-visible:ring-2 focus-visible:ring-primary"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//         </div>
//       </div>
      
//       <div className="container mx-auto px-4 py-12">

//         <div className="flex flex-col md:flex-row gap-8">
//           {/* Sidebar */}
//           <div className="md:w-1/4 space-y-8">
//             {/* Categories */}
//             <Card className="p-6">
//               <h3 className="text-lg font-semibold mb-4 flex items-center">
//                 <Tag className="h-5 w-5 mr-2 text-primary" />
//                 Categories
//               </h3>
//               <ScrollArea className="h-48 pr-2">
//                 <div className="space-y-2">
//                   {categories.map((category) => (
//                     <button
//                       key={category}
//                       className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedCategory === category ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent/50'}`}
//                       onClick={() => setSelectedCategory(category)}
//                     >
//                       {category}
//                     </button>
//                   ))}
//                 </div>
//               </ScrollArea>
//             </Card>
            
//             {/* Popular Tags */}
//             <Card className="p-6">
//               <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
//               <div className="flex flex-wrap gap-2">
//                 {allTags.slice(0, 12).map((tag) => (
//                   <Badge 
//                     key={tag} 
//                     variant={selectedTag === tag ? 'default' : 'secondary'}
//                     className="cursor-pointer hover:bg-primary/10"
//                     onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
//                   >
//                     {tag}
//                   </Badge>
//                 ))}
//               </div>
//             </Card>
            
//             {/* Recent Posts */}
//             <Card className="p-6">
//               <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
//               <div className="space-y-4">
//                 {blogs.slice(0, 3).map((post) => (
//                   <div 
//                     key={post.id} 
//                     className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/30 cursor-pointer transition-colors"
//                     onClick={() => handleViewPost(post.id)}
//                   >
//                     <div className="w-16 h-16 bg-muted rounded-md overflow-hidden">
//                       <img 
//                         src={post.image} 
//                         alt={post.title} 
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                     <div>
//                       <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
//                       <div className="flex items-center text-xs text-muted-foreground mt-1">
//                         <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//           </div>
          
//           {/* Main Content */}
//           <div className="md:w-3/4">

//             {/* Search Results Info */}
//             <div className="mb-8">
//               <h2 className="text-2xl font-bold text-foreground mb-2">
//                 {searchQuery || selectedCategory !== 'All' || selectedTag ? 'Search Results' : 'Latest Articles'}
//               </h2>
//               <p className="text-muted-foreground">
//                 Showing {filteredBlogs.length} {filteredBlogs.length === 1 ? 'post' : 'posts'}
//                 {searchQuery && ` for "${searchQuery}"`}
//                 {selectedCategory !== 'All' && ` in ${selectedCategory}`}
//                 {selectedTag && ` tagged with "${selectedTag}"`}
//               </p>
//             </div>

//             {filteredBlogs.length === 0 ? (
//               <div className="text-center py-16 bg-muted/50 rounded-lg">
//                 <p className="text-lg text-muted-foreground">No posts found matching your criteria.</p>
//                 <Button 
//                   variant="outline" 
//                   className="mt-4"
//                   onClick={() => {
//                     setSearchQuery('');
//                     setSelectedCategory('All');
//                     setSelectedTag(null);
//                   }}
//                 >
//                   Clear filters
//                 </Button>
//               </div>
//             ) : (
//               <div className="space-y-8">
//                 {/* Featured Post */}
//                 {currentPage === 1 && (
//                   <Card className="overflow-hidden hover:shadow-lg transition-shadow">
//                     <div className="md:flex">
//                       <div className="md:w-1/2">
//                         <img 
//                           src={filteredBlogs[0].image} 
//                           alt={filteredBlogs[0].title}
//                           className="w-full h-64 md:h-full object-cover"
//                         />
//                       </div>
//                       <div className="md:w-1/2 p-6 md:p-8">
//                         <Badge className="mb-3">{filteredBlogs[0].category}</Badge>
//                         <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
//                           {filteredBlogs[0].title}
//                         </h2>
//                         <p className="text-muted-foreground mb-6">
//                           {filteredBlogs[0].excerpt}
//                         </p>
//                         <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
//                           <div className="flex items-center gap-1">
//                             <User className="h-4 w-4" />
//                             {filteredBlogs[0].author}
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <Calendar className="h-4 w-4" />
//                             {format(new Date(filteredBlogs[0].date), 'MMM d, yyyy')}
//                           </div>
//                           <span className="flex items-center gap-1">
//                             <ClockIcon className="h-4 w-4" />
//                             {filteredBlogs[0].readTime}
//                           </span>
//                         </div>
//                         <Button onClick={() => handleViewPost(filteredBlogs[0].id)}>
//                           Read More <ArrowRight className="ml-2 h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </Card>
//                 )}
//                 </div>

//                 {/* Blog Grid */}
//                 <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
//                   {currentPosts.slice(currentPage === 1 ? 1 : 0).map((blog) => (
//                     <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
//                       <div className="aspect-video overflow-hidden">
//                         <img 
//                           src={blog.image} 
//                           alt={blog.title}
//                           className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
//                         />
//                       </div>
//                       <div className="p-6 flex flex-col flex-grow">
//                         <Badge className="w-fit mb-3">{blog.category}</Badge>
//                         <h3 className="text-xl font-semibold mb-2 line-clamp-2">{blog.title}</h3>
//                         <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">
//                           {blog.excerpt}
//                         </p>
//                         <div className="flex items-center justify-between text-sm text-muted-foreground mt-4 pt-4 border-t">
//                           <span>{format(new Date(blog.date), 'MMM d, yyyy')}</span>
//                           <span className="flex items-center gap-1">
//                             <ClockIcon className="h-4 w-4" />
//                             {blog.readTime}
//                           </span>
//                         </div>
//                         <Button 
//                           variant="link" 
//                           className="mt-4 p-0 h-auto justify-start text-foreground"
//                           onClick={() => handleViewPost(blog.id)}
//                         >
//                           Read More <ArrowRight className="ml-2 h-4 w-4" />
//                         </Button>
//                       </div>
//                     </Card>
//                   ))}
//                 </div>

//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                   <div className="flex justify-center mt-12">
//                     <div className="flex items-center gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => paginate(Math.max(1, currentPage - 1))}
//                         disabled={currentPage === 1}
//                       >
//                         <ChevronLeft className="h-4 w-4 mr-1" /> Previous
//                       </Button>
                      
//                       {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                         // Show first, last, and current page with neighbors
//                         let pageNum;
//                         if (totalPages <= 5) {
//                           pageNum = i + 1;
//                         } else if (currentPage <= 3) {
//                           pageNum = i + 1;
//                         } else if (currentPage >= totalPages - 2) {
//                           pageNum = totalPages - 4 + i;
//                         } else {
//                           pageNum = currentPage - 2 + i;
//                         }
                        
//                         return (
//                           <Button
//                             key={pageNum}
//                             variant={currentPage === pageNum ? "default" : "outline"}
//                             size="sm"
//                             onClick={() => paginate(pageNum)}
//                             className={currentPage === pageNum ? "font-bold" : ""}
//                           >
//                             {pageNum}
//                           </Button>
//                         );
//                       })}
                      
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
//                         disabled={currentPage === totalPages}
//                       >
//                         Next <ChevronRight className="h-4 w-4 ml-1" />
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
      
//       <Footer />
//     </div>
//   );
// };

// export default Blogs;
//         <div className="text-center mt-12">
//           <Button variant="outline" size="lg">
//             Load More Articles
//           </Button>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   )
// }

// export default Blogs

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  User,
  ArrowRight,
  Search,
  Clock as ClockIcon,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

// Define blog post type
type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  tags?: string[];
  content?: string;
};

const Blogs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Sample blog data
  const blogs: BlogPost[] = [
    {
      id: 1,
      title: "Essential Car Maintenance Tips for Indian Roads",
      excerpt:
        "Learn how to keep your car in perfect condition while navigating challenging Indian road conditions.",
      image:
        "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1200&auto=format&fit=crop",
      author: "Rajesh Kumar",
      date: "2024-01-15",
      category: "Car Care",
      readTime: "5 min read",
      tags: ["maintenance", "car care", "tips"],
      content: "Detailed content about car maintenance tips...",
    },
    {
      id: 2,
      title: "Bike Service: When and Why You Need It",
      excerpt:
        "Understanding the importance of regular bike servicing and how it extends your vehicle's life.",
      image:
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop",
      author: "Priya Sharma",
      date: "2024-01-12",
      category: "Bike Care",
      readTime: "4 min read",
      tags: ["bike maintenance", "service schedule", "two-wheeler"],
      content: "Detailed content about bike servicing...",
    },
    {
      id: 3,
      title: "Top 10 Warning Signs Your Car Needs Immediate Attention",
      excerpt:
        "Don't ignore these critical warning signs that indicate your car needs professional service.",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
      author: "Amit Singh",
      date: "2024-01-10",
      category: "Car Care",
      readTime: "6 min read",
      tags: ["car maintenance", "warning signs", "safety"],
      content: "Detailed content about warning signs...",
    },
    {
      id: 4,
      title: "Monsoon Vehicle Care: Protecting Your Ride",
      excerpt:
        "Essential tips to protect your vehicle during the monsoon season in India.",
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=1200&auto=format&fit=crop",
      author: "Sneha Patel",
      date: "2024-01-08",
      category: "Seasonal Care",
      readTime: "7 min read",
      tags: ["monsoon care", "seasonal maintenance", "water damage"],
      content: "Detailed content about monsoon care...",
    },
    {
      id: 5,
      title: "Electric vs Petrol: Which is Better for Indian Cities?",
      excerpt:
        "A comprehensive comparison of electric and petrol vehicles for urban Indian driving.",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop",
      author: "Vikram Reddy",
      date: "2024-01-05",
      category: "Industry News",
      readTime: "8 min read",
      tags: ["electric vehicles", "comparison", "sustainability"],
      content:
        "Detailed comparison between electric and petrol vehicles...",
    },
    {
      id: 6,
      title: "DIY Basic Car Maintenance You Can Do at Home",
      excerpt:
        "Simple maintenance tasks every car owner can perform to save money and time.",
      image:
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1200&auto=format&fit=crop",
      author: "Meera Joshi",
      date: "2024-01-03",
      category: "DIY Tips",
      readTime: "5 min read",
      tags: ["DIY", "car maintenance", "savings"],
      content: "Detailed DIY maintenance tips...",
    },
    {
      id: 7,
      title: "The Future of Electric Vehicles in India",
      excerpt:
        "Exploring the growth and challenges of electric vehicles in the Indian market.",
      image:
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1200&auto=format&fit=crop",
      author: "Rahul Verma",
      date: "2024-01-20",
      category: "Industry News",
      readTime: "6 min read",
      tags: ["electric vehicles", "future tech", "sustainability"],
      content: "Detailed content about EVs in India...",
    },
    {
      id: 8,
      title:
        "Winter Car Care: Preparing Your Vehicle for Cold Weather",
      excerpt:
        "Essential winter car care tips to keep your vehicle running smoothly in cold conditions.",
      image:
        "https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1200&auto=format&fit=crop",
      author: "Anjali Mehta",
      date: "2024-01-18",
      category: "Seasonal Care",
      readTime: "5 min read",
      tags: ["winter care", "seasonal maintenance", "battery care"],
      content: "Detailed winter car care tips...",
    },
    {
      id: 9,
      title: "How to Choose the Right Engine Oil for Your Car",
      excerpt:
        "A comprehensive guide to selecting the perfect engine oil for your vehicle's needs.",
      image:
        "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=1200&auto=format&fit=crop",
      author: "Vikram Singh",
      date: "2024-01-16",
      category: "Car Care",
      readTime: "7 min read",
      tags: ["engine oil", "car maintenance", "lubricants"],
      content: "Detailed guide on engine oil selection...",
    },
  ];

  // Extract all unique categories and tags
  const categories = ["All", ...new Set(blogs.map((b) => b.category))];
  const allTags = Array.from(
    new Set(blogs.flatMap((b) => b.tags || []))
  );

  // Filter + search
  const filteredBlogs = blogs.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.title.toLowerCase().includes(q) ||
      b.excerpt.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory === "All" || b.category === selectedCategory;
    const matchesTag =
      !selectedTag || (b.tags && b.tags.includes(selectedTag));
    return matchesSearch && matchesCategory && matchesTag;
  });

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredBlogs.slice(
    indexOfFirstPost,
    indexOfLastPost
  );
  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleViewPost = (postId: number) => {
    navigate(`/blog/${postId}`);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Wheelyfix Blog
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Expert insights, tips, and guides for vehicle maintenance and
            care
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              className="pl-10 pr-4 py-6 text-base rounded-lg shadow-lg border-0 focus-visible:ring-2 focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-1/4 space-y-8">
            {/* Categories */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-primary" />
                Categories
              </h3>
              <ScrollArea className="h-48 pr-2">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent/50"
                      }`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Popular Tags */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 12).map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "secondary"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Recent Posts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {blogs.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/30 cursor-pointer transition-colors"
                    onClick={() => handleViewPost(post.id)}
                  >
                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm line-clamp-2">
                        {post.title}
                      </h4>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(post.date), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="md:w-3/4">
            {/* Search Results Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {searchQuery ||
                selectedCategory !== "All" ||
                selectedTag
                  ? "Search Results"
                  : "Latest Articles"}
              </h2>
              <p className="text-muted-foreground">
                Showing {filteredBlogs.length}{" "}
                {filteredBlogs.length === 1 ? "post" : "posts"}
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {selectedTag && ` tagged with "${selectedTag}"`}
              </p>
            </div>

            {filteredBlogs.length === 0 ? (
              <div className="text-center py-16 bg-muted/50 rounded-lg">
                <p className="text-lg text-muted-foreground">
                  No posts found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedTag(null);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                {/* Featured Post */}
                {currentPage === 1 && (
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow mb-8">
                    <div className="md:flex">
                      <div className="md:w-1/2">
                        <img
                          src={filteredBlogs[0].image}
                          alt={filteredBlogs[0].title}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      </div>
                      <div className="md:w-1/2 p-6 md:p-8">
                        <Badge className="mb-3">
                          {filteredBlogs[0].category}
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                          {filteredBlogs[0].title}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                          {filteredBlogs[0].excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {filteredBlogs[0].author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(
                              new Date(filteredBlogs[0].date),
                              "MMM d, yyyy"
                            )}
                          </div>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {filteredBlogs[0].readTime}
                          </span>
                        </div>
                        <Button
                          onClick={() =>
                            handleViewPost(filteredBlogs[0].id)
                          }
                        >
                          Read More <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Blog Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {currentPosts
                    .slice(currentPage === 1 ? 1 : 0)
                    .map((blog) => (
                      <Card
                        key={blog.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col"
                      >
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <Badge className="w-fit mb-3">
                            {blog.category}
                          </Badge>
                          <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                            {blog.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">
                            {blog.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mt-4 pt-4 border-t">
                            <span>
                              {format(new Date(blog.date), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {blog.readTime}
                            </span>
                          </div>
                          <Button
                            variant="link"
                            className="mt-4 p-0 h-auto justify-start text-foreground"
                            onClick={() => handleViewPost(blog.id)}
                          >
                            Read More{" "}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          paginate(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>

                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => paginate(pageNum)}
                              className={
                                currentPage === pageNum ? "font-bold" : ""
                              }
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          paginate(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blogs;
