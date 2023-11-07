import express, { Request, Response } from 'express';
import mongoose, { Document, Model, Schema } from 'mongoose';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8000;

// MongoDB 연결 설정
const mongoURI = 'mongodb://localhost:27017/blogposts'; // MongoDB 서버 URI 및 데이터베이스 이름을 수정하세요.
mongoose.connect(mongoURI);

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB 연결 오류:', err);
});

db.once('open', () => {
  console.log('MongoDB에 연결되었습니다.');
});

// blogposts 컬렉션에 접근
const blogPostsCollection = db.collection('blogposts');

app.use(cors());
app.use(express.json());

// 라우트를 추가하여 blogPosts 컬렉션의 데이터 조회
app.get('/blogposts', async (req: Request, res: Response) => {
  try {
    // blogPosts 컬렉션에서 모든 문서 조회
    const blogPosts = await blogPostsCollection.find({}).toArray();
    res.json(blogPosts);
  } catch (error) {
    console.error('데이터 조회 오류:', error);
    res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

export interface BlogPost {
  title: string;
  body: string;
  regDate: string;
}

const BlogPostSchema = new Schema<BlogPost>({
  title: String,
  body: String,
  regDate: String,
});

const BlogPostModel: any = mongoose.model('blogposts', BlogPostSchema);

// 나머지 코드

app.post('/blogposts', async (req: Request, res: Response) => {
  try {
    const { title, body, regDate } = req.body as BlogPost;

    // 새로운 블로그 글 생성
    const newPost = new BlogPostModel({
      title,
      body,
      regDate,
    });

    // MongoDB에 저장
    await newPost.save();

    res.json({ message: '새로운 블로그 글이 성공적으로 생성되었습니다.' });
  } catch (error) {
    console.error('블로그 글 생성 오류:', error);
    res.status(500).json({ error: '블로그 글 생성 중 오류가 발생했습니다.' });
  }
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});

app.delete('/blogposts/:id', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    await BlogPostModel.findByIdAndRemove(postId);
    res.json({ message: '블로그 글이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('블로그 글 삭제 오류:', error);
    res.status(500).json({ error: '블로그 글 삭제 중 오류가 발생했습니다.' });
  }
});

app.get('/blogposts/:id', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const post = await BlogPostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ error: '포스트를 찾을 수 없습니다.' });
    }

    res.json(post);
  } catch (error) {
    console.error('포스트 조회 오류:', error);
    res.status(500).json({ error: '포스트 조회 중 오류가 발생했습니다.' });
  }
});

app.put('/blogposts/:id', async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const { title, body, regDate } = req.body as BlogPost;

    // Find the blog post by ID
    const post = await BlogPostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ error: '포스트를 찾을 수 없습니다.' });
    }

    // Update the blog post properties
    post.title = title;
    post.body = body;
    post.regDate = regDate;

    // Save the updated post to MongoDB
    await post.save();

    res.json({ message: '블로그 글이 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('블로그 글 업데이트 오류:', error);
    res.status(500).json({ error: '블로그 글 업데이트 중 오류가 발생했습니다.' });
  }
});
