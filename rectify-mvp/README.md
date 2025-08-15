# RECtify MVP - Issue Resolution Platform

A comprehensive platform for tracking, managing, and resolving issues efficiently. Built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Issue Tracking**: Create, view, and manage issues with detailed information
- **Smart Filtering**: Search and filter issues by status, priority, and content
- **Real-time Statistics**: Dashboard with live metrics and analytics
- **Priority Management**: Categorize issues by priority levels (Low, Medium, High, Critical)
- **Status Tracking**: Track issue progress (Open, In Progress, Resolved)
- **Responsive Design**: Modern, mobile-first UI that works on all devices
- **Accessibility**: Built with accessibility best practices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **UI Components**: Custom components with Headless UI
- **State Management**: React Hooks (useState)

## 📋 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rectify-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎯 Core Functionality

### Issue Management
- **Create Issues**: Use the "Create Issue" button to add new issues with detailed information
- **View Issues**: Browse all issues in a clean, organized list
- **Search**: Find specific issues using the search functionality
- **Filter**: Filter issues by status (All, Open, In Progress, Resolved)
- **Priority Levels**: Visual indicators for different priority levels

### Dashboard Analytics
- **Total Issues**: Overview of all issues in the system
- **Status Breakdown**: Visual representation of issue distribution
- **Real-time Updates**: Statistics update automatically as issues are created/modified

### User Experience
- **Modern UI**: Clean, professional interface with smooth transitions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main dashboard page
├── components/
│   └── CreateIssueModal.tsx # Modal for creating new issues
└── types/                   # TypeScript type definitions
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563EB)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray shades

### Typography
- **Headings**: Bold, clear hierarchy
- **Body**: Readable, accessible font sizes
- **Labels**: Consistent sizing and spacing

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🔮 Future Enhancements

- **Backend Integration**: Connect to a real database and API
- **User Authentication**: Add user login and role-based access
- **Real-time Updates**: WebSocket integration for live updates
- **File Attachments**: Support for uploading files and images
- **Comments System**: Add comments and discussion threads to issues
- **Email Notifications**: Automated notifications for issue updates
- **Advanced Analytics**: More detailed reporting and insights
- **Team Management**: User roles and team assignment features
- **Integration APIs**: Connect with popular tools (Slack, JIRA, GitHub)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help with the project, please open an issue or contact the development team.

---

**RECtify MVP** - Rectify Issues, Streamline Solutions 🎯
