import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, Save, Eye } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  is_published: boolean;
  tags: string[];
  created_at: string;
}

const AdminBlogPosts = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const raw = localStorage.getItem('blog_posts');
      const data = raw ? (JSON.parse(raw) as BlogPost[]) : [];
      setBlogPosts(data.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({ title: 'Error', description: 'Failed to load blog posts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSave = async () => {
    if (!editingPost || !user) return;

    const slug = generateSlug(editingPost.title);
    
    try {
      const raw = localStorage.getItem('blog_posts');
      const list: BlogPost[] = raw ? JSON.parse(raw) : [];
      if (editingPost.id.startsWith('new-')) {
        list.unshift({ ...editingPost, id: crypto.randomUUID(), created_at: new Date().toISOString() });
      } else {
        const idx = list.findIndex(p => p.id === editingPost.id);
        if (idx !== -1) list[idx] = { ...editingPost };
      }
      localStorage.setItem('blog_posts', JSON.stringify(list));
      toast({ title: 'Success', description: 'Blog post saved successfully' });
      setIsDialogOpen(false);
      setEditingPost(null);
      fetchBlogPosts();
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast({ title: 'Error', description: 'Failed to save blog post', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const raw = localStorage.getItem('blog_posts');
      const list: BlogPost[] = raw ? JSON.parse(raw) : [];
      const next = list.filter(p => p.id !== id);
      localStorage.setItem('blog_posts', JSON.stringify(next));
      toast({ title: 'Success', description: 'Blog post deleted successfully' });
      fetchBlogPosts();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({ title: 'Error', description: 'Failed to delete blog post', variant: 'destructive' });
    }
  };

  const openCreateDialog = () => {
    setEditingPost({
      id: 'new-' + Date.now(),
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image_url: '',
      is_published: false,
      tags: [],
      created_at: new Date().toISOString(),
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Posts Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost?.id.startsWith('new-') ? 'Create Blog Post' : 'Edit Blog Post'}
              </DialogTitle>
            </DialogHeader>
            {editingPost && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={editingPost.excerpt}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="featured_image_url">Featured Image URL</Label>
                  <Input
                    id="featured_image_url"
                    value={editingPost.featured_image_url}
                    onChange={(e) => setEditingPost({ ...editingPost, featured_image_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={editingPost.tags.join(', ')}
                    onChange={(e) => setEditingPost({ 
                      ...editingPost, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingPost.is_published}
                    onCheckedChange={(checked) => setEditingPost({ ...editingPost, is_published: checked })}
                  />
                  <Label>Published</Label>
                </div>
                <Button onClick={handleSave} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Post
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {blogPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No blog posts yet. Create your first post!</p>
            </CardContent>
          </Card>
        ) : (
          blogPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={post.is_published ? "default" : "secondary"}>
                        {post.is_published ? "Published" : "Draft"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBlogPosts;