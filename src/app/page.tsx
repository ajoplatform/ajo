"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Users,
  Wallet,
  Calendar,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Home,
  Clock,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  User,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  MoreVertical,
  Eye,
  EyeOff,
  Copy,
  Share2,
  QrCode,
  Upload,
  Crown,
  Shield,
  Link2,
  DollarSign,
  AlertTriangle,
  Info,
  Mail,
  Phone,
  Lock,
  KeyRound,
  UserPlus,
  Gift,
  ChevronRight,
  ArrowLeft,
  Building2,
  Check,
  XCircle,
  Clock4,
  Filter,
  Search,
  MessageCircle,
  Trash2,
  Edit,
  Ban,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Brain,
  Zap,
  Target,
  Lightbulb,
  Cpu,
  Send,
  Image as ImageIcon,
  FileText,
  Play,
  Pause,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
type UserRole = "super_admin" | "group_admin" | "member";
type GroupStatus = "pending" | "active" | "paused" | "completed" | "cancelled";
type ContributionStatus = "pending" | "processing" | "confirmed" | "rejected" | "late" | "defaulted";
type ContributionType = "weekly" | "monthly";
type AppScreen = "landing" | "auth" | "dashboard";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  totalSavings: number;
  activeGroups: number;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: Date;
}

interface GroupMember {
  userId: string;
  name: string;
  position: number;
  positions: number;
  status: "active" | "suspended" | "removed" | "completed";
  hasPaid: boolean;
  totalContribution: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  contributionType: ContributionType;
  contributionAmount: number;
  currency: string;
  maxMembers: number;
  totalCycles: number;
  currentCycle: number;
  startDate: Date;
  status: GroupStatus;
  ownerId: string;
  adminId: string;
  members: GroupMember[];
  penaltySettings: {
    type: "percentage" | "fixed";
    value: number;
    gracePeriod: number;
  };
  chargeSettings: {
    type: "percentage" | "fixed";
    value: number;
  };
  inviteCode: string;
  nextPayout: {
    position: number;
    name: string;
    date: Date;
  };
  userPosition: number;
  userHasReceivedPayout: boolean;
}

interface Contribution {
  id: string;
  groupId: string;
  groupName: string;
  cycleId: string;
  userId: string;
  amount: number;
  expectedDate: Date;
  paidDate: Date | null;
  status: ContributionStatus;
  proofs: ProofOfPayment[];
}

interface ProofOfPayment {
  id: string;
  imageUrl: string;
  referenceNumber: string;
  notes: string;
  uploadedAt: Date;
  status: "pending" | "approved" | "rejected";
}

interface Notification {
  id: string;
  type: "contribution_due" | "payout_incoming" | "member_joined" | "proof_reviewed" | "penalty_applied" | "ai_insight";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIInsight {
  type: "positive" | "warning" | "tip";
  title: string;
  message: string;
  actionable: boolean;
}

// Test accounts for each role
const testAccounts: User[] = [
  {
    id: "1",
    name: "Chidi Nwankwo",
    email: "superadmin@ajosync.com",
    phone: "+234 800 000 0001",
    avatar: "",
    role: "super_admin",
    totalSavings: 5000000,
    activeGroups: 5,
    referralCode: "CHI01S",
    referralCount: 25,
    referralEarnings: 75000,
    bankDetails: {
      bankName: "GTBank",
      accountNumber: "0123456789",
      accountName: "Chidi Nwankwo",
    },
    createdAt: new Date("2023-01-01"),
  },
  {
    id: "2",
    name: "Funke Adeyemi",
    email: "groupadmin@ajosync.com",
    phone: "+234 800 000 0002",
    avatar: "",
    role: "group_admin",
    totalSavings: 3200000,
    activeGroups: 4,
    referralCode: "FUN02G",
    referralCount: 12,
    referralEarnings: 36000,
    bankDetails: {
      bankName: "Access Bank",
      accountNumber: "9876543210",
      accountName: "Funke Adeyemi",
    },
    createdAt: new Date("2023-06-15"),
  },
  {
    id: "3",
    name: "Adaeze Okonkwo",
    email: "member@ajosync.com",
    phone: "+234 801 234 5678",
    avatar: "",
    role: "member",
    totalSavings: 2450000,
    activeGroups: 3,
    referralCode: "ADA24X",
    referralCount: 5,
    referralEarnings: 15000,
    bankDetails: {
      bankName: "GTBank",
      accountNumber: "0123456789",
      accountName: "Adaeze Okonkwo",
    },
    createdAt: new Date("2024-01-15"),
  },
];

// Default mock user (member)
const mockUser: User = testAccounts[2];

const mockGroups: Group[] = [
  {
    id: "1",
    name: "Family Savings Circle",
    description: "Monthly contribution for family members",
    contributionType: "monthly",
    contributionAmount: 50000,
    currency: "NGN",
    maxMembers: 12,
    totalCycles: 12,
    currentCycle: 4,
    startDate: new Date("2024-10-01"),
    status: "active",
    ownerId: "2",
    adminId: "2",
    members: [
      { userId: "1", name: "Adaeze Okonkwo", position: 1, positions: 1, status: "active", hasPaid: true, totalContribution: 200000 },
      { userId: "2", name: "Chinedu Eze", position: 2, positions: 1, status: "active", hasPaid: true, totalContribution: 200000 },
      { userId: "3", name: "Ngozi Obi", position: 3, positions: 1, status: "active", hasPaid: false, totalContribution: 150000 },
      { userId: "4", name: "Emeka Nwosu", position: 4, positions: 1, status: "active", hasPaid: true, totalContribution: 200000 },
      { userId: "5", name: "Chioma Adeyemi", position: 5, positions: 1, status: "active", hasPaid: false, totalContribution: 150000 },
    ],
    penaltySettings: { type: "percentage", value: 5, gracePeriod: 3 },
    chargeSettings: { type: "percentage", value: 1 },
    inviteCode: "FAM2024",
    nextPayout: { position: 3, name: "Ngozi Obi", date: new Date("2025-02-01") },
    userPosition: 1,
    userHasReceivedPayout: false,
  },
  {
    id: "2",
    name: "Office Thrift Group",
    description: "Weekly savings for office colleagues",
    contributionType: "weekly",
    contributionAmount: 10000,
    currency: "NGN",
    maxMembers: 10,
    totalCycles: 10,
    currentCycle: 7,
    startDate: new Date("2024-12-01"),
    status: "active",
    ownerId: "1",
    adminId: "1",
    members: [
      { userId: "1", name: "Adaeze Okonkwo", position: 1, positions: 1, status: "active", hasPaid: true, totalContribution: 70000 },
      { userId: "6", name: "Oluwaseun Bakare", position: 2, positions: 1, status: "active", hasPaid: true, totalContribution: 70000 },
      { userId: "7", name: "Tunde Adebayo", position: 3, positions: 1, status: "active", hasPaid: true, totalContribution: 70000 },
    ],
    penaltySettings: { type: "fixed", value: 500, gracePeriod: 2 },
    chargeSettings: { type: "percentage", value: 0 },
    inviteCode: "OFF2024",
    nextPayout: { position: 8, name: "Amina Hassan", date: new Date("2025-01-27") },
    userPosition: 1,
    userHasReceivedPayout: true,
  },
];

const mockContributions: Contribution[] = [
  {
    id: "1",
    groupId: "1",
    groupName: "Family Savings Circle",
    cycleId: "4",
    userId: "1",
    amount: 50000,
    expectedDate: new Date("2025-01-25"),
    paidDate: new Date("2025-01-20"),
    status: "confirmed",
    proofs: [],
  },
  {
    id: "2",
    groupId: "2",
    groupName: "Office Thrift Group",
    cycleId: "7",
    userId: "1",
    amount: 10000,
    expectedDate: new Date("2025-01-27"),
    paidDate: null,
    status: "pending",
    proofs: [],
  },
];

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "contribution_due",
    title: "Contribution Due",
    message: "Your contribution of ₦10,000 for Office Thrift Group is due in 2 days",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "payout_incoming",
    title: "Payout Incoming",
    message: "You will receive ₦500,000 from Family Savings Circle on Feb 1, 2025",
    time: "1 day ago",
    read: false,
  },
  {
    id: "3",
    type: "ai_insight",
    title: "AI Insight",
    message: "Your savings rate has improved by 15% this month. Keep it up!",
    time: "3 days ago",
    read: true,
  },
];

// Utility functions
const formatCurrency = (amount: number, currency = "NGN") => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

// Generate session ID for chat
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============================================
// LANDING PAGE
// ============================================

function LandingPage({ onGetStarted, onLogin }: { onGetStarted: () => void; onLogin: () => void }) {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get personalized financial advice and predictions powered by advanced AI",
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      icon: Cpu,
      title: "AjoBot Assistant",
      description: "24/7 AI assistant to help you navigate savings groups and contributions",
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      icon: Mic,
      title: "Voice Commands",
      description: "Control your account with voice - pay contributions, check balance, and more",
      color: "bg-green-500/10 text-green-500"
    },
    {
      icon: Sparkles,
      title: "Smart Proof Verification",
      description: "AI automatically analyzes and verifies your payment proofs instantly",
      color: "bg-amber-500/10 text-amber-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-xl">AjoSync</h1>
                <p className="text-xs text-muted-foreground">AI-First Savings</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogin}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* AI Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-First Thrift Platform</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Traditional Savings,
            <br />
            <span className="text-primary">Powered by AI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands using AI-powered thrift savings (Ajo/Esusu). Get intelligent insights, 
            voice commands, and automated proof verification - all in one app.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="h-14 px-8 text-lg" onClick={onGetStarted}>
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg" onClick={onLogin}>
              Sign In
            </Button>
          </div>
        </motion.div>

        {/* Feature Carousel */}
        <div className="w-full max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0", features[currentFeature].color)}>
                      {(() => { const Icon = features[currentFeature].icon; return <Icon className="h-7 w-7" />; })()}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-lg mb-1">{features[currentFeature].title}</h3>
                      <p className="text-muted-foreground">{features[currentFeature].description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeature(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentFeature ? "w-8 bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Why Choose AjoSync?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Users, title: "Group Savings", desc: "Create or join savings groups with friends, family, or colleagues" },
            { icon: Shield, title: "Secure Platform", desc: "Bank-grade security with transparent transaction tracking" },
            { icon: Zap, title: "Instant Payouts", desc: "Receive your payout automatically when it's your turn" },
            { icon: Target, title: "Goal Tracking", desc: "Set savings goals and track your progress with AI insights" },
            { icon: Gift, title: "Referral Rewards", desc: "Earn bonuses by inviting friends to the platform" },
            { icon: Lightbulb, title: "Smart Reminders", desc: "AI-powered notifications for contributions and payouts" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold mb-3">Ready to Start Saving Smarter?</h2>
            <p className="opacity-90 mb-6">
              Join AjoSync today and let AI help you achieve your financial goals.
            </p>
            <Button size="lg" variant="secondary" className="h-12 px-8" onClick={onGetStarted}>
              Create Free Account
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 AjoSync. AI-Powered Thrift Savings Platform.</p>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// AI CHAT COMPONENT
// ============================================

function AIChatBot({ isOpen, onClose, userContext }: { isOpen: boolean; onClose: () => void; userContext?: User }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(generateSessionId());
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          sessionId,
          context: userContext ? { name: userContext.name, role: userContext.role, totalSavings: userContext.totalSavings } : null
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Failed to get response from AjoBot");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) return;

    setIsListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("mode", "transcribe");

        try {
          const response = await fetch("/api/ai/asr", {
            method: "POST",
            body: formData
          });
          const data = await response.json();
          if (data.success && data.transcription) {
            setInput(data.transcription);
          }
        } catch (error) {
          toast.error("Voice recognition failed");
        }
        stream.getTracks().forEach(track => track.stop());
        setIsListening(false);
      };

      mediaRecorder.start();
      await new Promise(resolve => setTimeout(resolve, 3000));
      mediaRecorder.stop();
    } catch (error) {
      toast.error("Microphone access denied");
      setIsListening(false);
    }
  };

  const speakResponse = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    try {
      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "tongtong", speed: 1.0 })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch (error) {
      toast.error("Failed to play audio");
      setIsSpeaking(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-left">AjoBot</SheetTitle>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground mb-4">How can I help you today?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["How do I join a group?", "What is Ajo/Esusu?", "Check my balance", "Savings tips"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2 max-w-[80%]",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mt-1"
                        onClick={() => speakResponse(msg.content)}
                      >
                        {isSpeaking ? (
                          <VolumeX className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              className={cn(isListening && "text-destructive")}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AjoBot anything..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================
// AI INSIGHTS CARD
// ============================================

function AIInsightsCard({ user }: { user: User }) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingsScore, setSavingsScore] = useState(75);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userData: { totalSavings: user.totalSavings, activeGroups: user.activeGroups },
          groups: mockGroups,
          contributions: mockContributions
        })
      });

      const data = await response.json();
      if (data.success && data.insights) {
        setInsights(data.insights.insights || []);
        if (data.insights.savingsHealth?.score) {
          setSavingsScore(data.insights.savingsHealth.score);
        }
      }
    } catch (error) {
      // Use fallback insights
      setInsights([
        { type: "positive", title: "Great Progress!", message: "You're on track with your savings goals.", actionable: false },
        { type: "tip", title: "Increase Savings", message: "Consider increasing your monthly contribution by 10%.", actionable: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadInsights} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Savings Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Savings Health Score</span>
            <span className="font-bold text-primary">{savingsScore}%</span>
          </div>
          <Progress value={savingsScore} className="h-2" />
        </div>

        {/* Insights List */}
        <div className="space-y-2">
          {insights.slice(0, 3).map((insight, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-2 p-3 rounded-lg text-sm",
                insight.type === "positive" && "bg-success/10 text-success",
                insight.type === "warning" && "bg-warning/10 text-warning",
                insight.type === "tip" && "bg-primary/10 text-primary"
              )}
            >
              {insight.type === "positive" && <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />}
              {insight.type === "warning" && <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
              {insight.type === "tip" && <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />}
              <div>
                <p className="font-medium">{insight.title}</p>
                <p className="opacity-80 text-xs mt-0.5">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// VOICE COMMAND BUTTON
// ============================================

function VoiceCommandButton({ onCommand }: { onCommand: (command: { action: string; params: Record<string, unknown> }) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startListening = async () => {
    if (isListening || isProcessing) return;

    setIsListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);
        
        const blob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("mode", "command");

        try {
          const response = await fetch("/api/ai/asr", {
            method: "POST",
            body: formData
          });
          const data = await response.json();
          if (data.success && data.command) {
            toast.success(`Voice command: "${data.transcription}"`);
            onCommand(data.command);
          }
        } catch (error) {
          toast.error("Voice command failed");
        } finally {
          setIsProcessing(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      await new Promise(resolve => setTimeout(resolve, 4000));
      mediaRecorder.stop();
    } catch (error) {
      toast.error("Microphone access denied");
      setIsListening(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={startListening}
      disabled={isProcessing}
      className={cn(
        "relative",
        isListening && "border-destructive text-destructive animate-pulse"
      )}
    >
      {isProcessing ? (
        <RefreshCw className="h-5 w-5 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
      {isListening && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />
      )}
    </Button>
  );
}

// ============================================
// SMART PROOF UPLOAD
// ============================================

function SmartProofUpload({
  contribution,
  onUpload,
  onClose
}: {
  contribution: Contribution;
  onUpload: (proof: ProofOfPayment) => void;
  onClose: () => void;
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    hasReference: boolean;
    referenceNumber: string;
    hasAmount: boolean;
    extractedAmount: string;
    confidenceScore: number;
    recommendation: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      
      // Analyze with AI
      setIsAnalyzing(true);
      try {
        const response = await fetch("/api/ai/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            analysisType: "proof_verification",
            context: { expectedAmount: contribution.amount, currency: "NGN" }
          })
        });

        const data = await response.json();
        if (data.success && data.analysis) {
          setAiAnalysis(data.analysis);
          if (data.analysis.referenceNumber && data.analysis.referenceNumber !== "Not found") {
            setReference(data.analysis.referenceNumber);
          }
        }
      } catch (error) {
        console.error("AI analysis failed:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imagePreview) {
      toast.error("Please upload a payment proof");
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const proof: ProofOfPayment = {
      id: Date.now().toString(),
      imageUrl: imagePreview,
      referenceNumber: reference,
      notes,
      uploadedAt: new Date(),
      status: "pending"
    };

    onUpload(proof);
    toast.success("Payment proof uploaded successfully!");
    onClose();
    setIsSubmitting(false);
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Upload Payment Proof
        </DialogTitle>
        <DialogDescription>
          Upload your payment screenshot for {formatCurrency(contribution.amount)} to {contribution.groupName}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Image Upload */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="proof-upload"
          />
          <label
            htmlFor="proof-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors overflow-hidden"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Proof" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload image</p>
              </div>
            )}
          </label>
        </div>

        {/* AI Analysis */}
        {isAnalyzing && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm">AI analyzing payment proof...</span>
          </div>
        )}

        {aiAnalysis && !isAnalyzing && (
          <Card className={cn(
            "border-2",
            aiAnalysis.recommendation === "approve" && "border-success bg-success/5",
            aiAnalysis.recommendation === "reject" && "border-destructive bg-destructive/5",
            aiAnalysis.recommendation === "manual_review" && "border-warning bg-warning/5"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">AI Analysis</span>
                <Badge variant="secondary" className="ml-auto">{aiAnalysis.confidenceScore}% confidence</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Reference: <span className="font-medium">{aiAnalysis.referenceNumber}</span></div>
                <div>Amount: <span className="font-medium">{aiAnalysis.extractedAmount}</span></div>
              </div>
              <Badge 
                className={cn(
                  "mt-2",
                  aiAnalysis.recommendation === "approve" && "bg-success text-success-foreground",
                  aiAnalysis.recommendation === "reject" && "bg-destructive text-destructive-foreground",
                  aiAnalysis.recommendation === "manual_review" && "bg-warning text-warning-foreground"
                )}
              >
                {aiAnalysis.recommendation === "approve" && "✓ Auto-approved"}
                {aiAnalysis.recommendation === "reject" && "✗ Issues detected"}
                {aiAnalysis.recommendation === "manual_review" && "⚠ Manual review needed"}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Reference Input */}
        <div className="space-y-2">
          <Label htmlFor="reference">Transaction Reference</Label>
          <Input
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Enter transaction reference"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information..."
            rows={2}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !imagePreview}>
          {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          Submit Proof
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============================================
// AUTH SCREENS
// ============================================

function AuthScreen({ onAuth }: { onAuth: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const matchedAccount = testAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    ) || mockUser;

    if (mode === "login") {
      onAuth(matchedAccount);
    } else if (mode === "register") {
      onAuth({ ...mockUser, name, email, phone, referralCode });
    } else if (mode === "forgot") {
      setResetSent(true);
    }

    setIsLoading(false);
  };

  const handleTestLogin = async (account: User) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onAuth(account);
    setIsLoading(false);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "group_admin":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-success/10 text-success border-success/20";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return <Crown className="h-4 w-4" />;
      case "group_admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <PiggyBank className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">AjoSync</h1>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-muted-foreground text-sm">AI-First Thrift Platform</p>
          </div>
        </div>

        {/* Test Accounts - Quick Login */}
        {mode === "login" && (
          <Card className="mb-4 border-accent/30 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-accent" />
                Test Accounts (Click to Login)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {testAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleTestLogin(account)}
                  disabled={isLoading}
                  className="w-full p-3 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-muted/50 transition-all text-left flex items-center gap-3 disabled:opacity-50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {account.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{account.name}</p>
                      <Badge
                        variant="outline"
                        className={cn("text-xs capitalize", getRoleBadgeColor(account.role))}
                      >
                        {getRoleIcon(account.role)}
                        <span className="ml-1">{account.role.replace("_", " ")}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Auth Card */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">
              {mode === "login" && "Welcome back"}
              {mode === "register" && "Create account"}
              {mode === "forgot" && "Reset password"}
              {mode === "reset" && "New password"}
            </CardTitle>
            <CardDescription className="text-center">
              {mode === "login" && "Sign in to your AI-powered savings account"}
              {mode === "register" && "Start your AI-powered savings journey"}
              {mode === "forgot" && "Enter your email to receive a reset link"}
              {mode === "reset" && "Enter your new password"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {mode === "forgot" && resetSent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Check your email</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>
                </p>
                <Button variant="outline" onClick={() => { setMode("login"); setResetSent(false); }}>
                  Back to login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Adaeze Okonkwo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+234 801 234 5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {mode === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="referral">Referral Code (Optional)</Label>
                    <div className="relative">
                      <Gift className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="referral"
                        placeholder="ABC123"
                        className="pl-10 uppercase"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter a referral code to earn bonus rewards!
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <>
                      {mode === "login" && "Sign In"}
                      {mode === "register" && "Create Account"}
                      {mode === "forgot" && "Send Reset Link"}
                      {mode === "reset" && "Update Password"}
                    </>
                  )}
                </Button>

                {mode === "login" && (
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-muted-foreground"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot password?
                  </Button>
                )}
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <p className="text-sm text-center text-muted-foreground">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => setMode("register")}>
                    Sign up
                  </Button>
                </>
              ) : mode === "register" ? (
                <>
                  Already have an account?{" "}
                  <Button variant="link" className="p-0 h-auto" onClick={() => setMode("login")}>
                    Sign in
                  </Button>
                </>
              ) : (
                <Button variant="link" className="p-0 h-auto" onClick={() => setMode("login")}>
                  Back to login
                </Button>
              )}
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

// ============================================
// DASHBOARD COMPONENTS
// ============================================

function Header({
  user,
  notifications,
  onMenuClick,
  onLogout,
  onOpenChat,
}: {
  user: User;
  notifications: Notification[];
  onMenuClick: () => void;
  onLogout: () => void;
  onOpenChat: () => void;
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg">AjoSync</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />AI
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Chat Button */}
            <Button variant="outline" size="icon" onClick={onOpenChat} className="relative">
              <Bot className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>
                <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <Card
                          key={notification.id}
                          className={cn(
                            "cursor-pointer transition-colors",
                            !notification.read && "bg-primary/5 border-primary/20"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                  notification.type === "contribution_due" && "bg-warning/10",
                                  notification.type === "payout_incoming" && "bg-success/10",
                                  notification.type === "member_joined" && "bg-primary/10",
                                  notification.type === "proof_reviewed" && "bg-accent/10",
                                  notification.type === "penalty_applied" && "bg-destructive/10",
                                  notification.type === "ai_insight" && "bg-purple-500/10"
                                )}
                              >
                                {notification.type === "contribution_due" && <Clock className="h-4 w-4 text-warning" />}
                                {notification.type === "payout_incoming" && <ArrowDownLeft className="h-4 w-4 text-success" />}
                                {notification.type === "member_joined" && <UserPlus className="h-4 w-4 text-primary" />}
                                {notification.type === "proof_reviewed" && <Check className="h-4 w-4 text-accent" />}
                                {notification.type === "penalty_applied" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                {notification.type === "ai_insight" && <Brain className="h-4 w-4 text-purple-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* User Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>Account</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <Badge variant="secondary" className="mt-1 capitalize">{user.role.replace("_", " ")}</Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <User className="h-4 w-4" />
                      Profile Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <Building2 className="h-4 w-4" />
                      Bank Details
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <Gift className="h-4 w-4" />
                      Referrals
                      <Badge variant="secondary" className="ml-auto">{user.referralCount}</Badge>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3">
                      <Settings className="h-4 w-4" />
                      Preferences
                    </Button>
                  </div>

                  <Separator />

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "groups", icon: Users, label: "My Groups" },
    { id: "contributions", icon: Wallet, label: "Contributions" },
    { id: "payouts", icon: TrendingUp, label: "Payouts" },
    { id: "referrals", icon: Gift, label: "Referrals" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-sidebar border-r border-sidebar-border",
          "lg:translate-x-0 transition-transform duration-300 lg:duration-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-6 border-b border-sidebar-border">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">AjoSync</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />AI-Powered
              </p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto lg:hidden" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    activeTab === item.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-sidebar-border">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI Assistant</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Ask AjoBot anything about your savings
                </p>
                <Button size="sm" className="w-full" onClick={() => onClose()}>
                  <Bot className="h-4 w-4 mr-2" />
                  Chat with AjoBot
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function BalanceCard({ user }: { user: User }) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-primary-foreground/80 text-sm">Total Savings</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-bold">
                {showBalance ? formatCurrency(user.totalSavings) : "₦***,***"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-foreground/10 rounded-lg p-3">
            <p className="text-primary-foreground/80 text-xs">Active Groups</p>
            <p className="text-xl font-bold mt-1">{user.activeGroups}</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-lg p-3">
            <p className="text-primary-foreground/80 text-xs">Referral Earnings</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(user.referralEarnings)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions({
  onCreateGroup,
  onJoinGroup,
  onUploadProof,
  onVoiceCommand,
}: {
  onCreateGroup: () => void;
  onJoinGroup: () => void;
  onUploadProof: () => void;
  onVoiceCommand: (cmd: { action: string; params: Record<string, unknown> }) => void;
}) {
  const actions = [
    { icon: Plus, label: "New Group", color: "bg-primary/10 text-primary", action: onCreateGroup },
    { icon: Users, label: "Join", color: "bg-accent/10 text-accent", action: onJoinGroup },
    { icon: Upload, label: "Upload", color: "bg-success/10 text-success", action: onUploadProof },
    { icon: Gift, label: "Refer", color: "bg-warning/10 text-warning", action: () => {} },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            onClick={action.action}
            className="h-auto flex-col gap-2 py-4 px-2 border-border/50 hover:border-primary/50"
          >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", action.color)}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
      {/* Voice Command */}
      <div className="flex items-center gap-2">
        <VoiceCommandButton onCommand={onVoiceCommand} />
        <span className="text-xs text-muted-foreground">Tap to use voice commands</span>
      </div>
    </div>
  );
}

function PendingContributions({
  contributions,
  onPay,
}: {
  contributions: Contribution[];
  onPay: (contribution: Contribution) => void;
}) {
  const pending = contributions.filter((c) => c.status === "pending");

  if (pending.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Pending Contributions
          </CardTitle>
          <Badge variant="secondary">{pending.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.map((contribution) => (
          <div
            key={contribution.id}
            className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
          >
            <div>
              <p className="font-medium text-sm">{contribution.groupName}</p>
              <p className="text-xs text-muted-foreground">Due: {formatDate(contribution.expectedDate)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatCurrency(contribution.amount)}</p>
              <Button size="sm" className="mt-1 h-7 text-xs" onClick={() => onPay(contribution)}>
                Pay Now
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function GroupCard({
  group,
  onViewDetails,
}: {
  group: Group;
  onViewDetails: (group: Group) => void;
}) {
  const progress = (group.currentCycle / group.totalCycles) * 100;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {group.name}
              {group.userPosition === 1 && !group.userHasReceivedPayout && (
                <Badge variant="default" className="text-xs">Your Turn!</Badge>
              )}
              {group.userHasReceivedPayout && (
                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                  Received
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-1">{group.description}</CardDescription>
          </div>
          <Badge variant="outline" className={cn(
            "text-xs",
            group.status === "active" && "border-success/30 text-success",
            group.status === "pending" && "border-warning/30 text-warning"
          )}>
            {group.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-3">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Cycle {group.currentCycle} of {group.totalCycles}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm font-semibold">{formatCurrency(group.contributionAmount)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-sm font-semibold">{group.members.length}/{group.maxMembers}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-semibold capitalize">{group.contributionType}</p>
            </div>
          </div>

          {/* Next Payout */}
          <div className="flex items-center justify-between text-sm bg-primary/5 rounded-lg p-2">
            <span className="text-muted-foreground">Next Payout:</span>
            <span className="font-medium">{group.nextPayout.name}</span>
          </div>

          <Button variant="outline" className="w-full" onClick={() => onViewDetails(group)}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN DASHBOARD
// ============================================

function Dashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [groups, setGroups] = useState(mockGroups);
  const [contributions, setContributions] = useState(mockContributions);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);

  const handleVoiceCommand = useCallback((command: { action: string; params: Record<string, unknown> }) => {
    switch (command.action) {
      case "navigate":
        setActiveTab(command.params.page as string);
        toast.success(`Navigated to ${command.params.page}`);
        break;
      case "check_balance":
        toast.info(`Your total savings: ${formatCurrency(user.totalSavings)}`);
        break;
      case "join_group":
        if (command.params.code) {
          toast.success(`Joining group with code: ${command.params.code}`);
        } else {
          setJoinGroupOpen(true);
        }
        break;
      case "create_group":
        setCreateGroupOpen(true);
        break;
      case "pay":
        toast.info(`Initiating payment...`);
        break;
      case "help":
        setChatOpen(true);
        break;
      default:
        toast.info(`Command: ${command.params.rawText || command.action}`);
    }
  }, [user.totalSavings]);

  const handleUploadProof = (proof: ProofOfPayment) => {
    if (selectedContribution) {
      setContributions(prev =>
        prev.map(c =>
          c.id === selectedContribution.id
            ? { ...c, proofs: [...c.proofs, proof], status: "processing" as ContributionStatus }
            : c
        )
      );
      setSelectedContribution(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={user}
          notifications={notifications}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={onLogout}
          onOpenChat={() => setChatOpen(true)}
        />

        <main className="flex-1 container mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Balance Card */}
                <BalanceCard user={user} />

                {/* Quick Actions */}
                <QuickActions
                  onCreateGroup={() => setCreateGroupOpen(true)}
                  onJoinGroup={() => setJoinGroupOpen(true)}
                  onUploadProof={() => {
                    const pending = contributions.find(c => c.status === "pending");
                    if (pending) setSelectedContribution(pending);
                  }}
                  onVoiceCommand={handleVoiceCommand}
                />

                {/* AI Insights */}
                <AIInsightsCard user={user} />

                {/* Pending Contributions */}
                <PendingContributions
                  contributions={contributions}
                  onPay={setSelectedContribution}
                />

                {/* Groups */}
                <div>
                  <h2 className="text-lg font-semibold mb-3">My Groups</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {groups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        onViewDetails={setSelectedGroup}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "groups" && (
              <motion.div
                key="groups"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold">My Groups</h1>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setJoinGroupOpen(true)}>
                      <Users className="h-4 w-4 mr-2" />
                      Join
                    </Button>
                    <Button onClick={() => setCreateGroupOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onViewDetails={setSelectedGroup}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "contributions" && (
              <motion.div
                key="contributions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-2xl font-bold mb-6">Contributions</h1>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {contributions.map((contribution) => (
                        <div
                          key={contribution.id}
                          className="flex items-center justify-between p-4 hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              contribution.status === "confirmed" && "bg-success/10",
                              contribution.status === "pending" && "bg-warning/10",
                              contribution.status === "processing" && "bg-primary/10"
                            )}>
                              {contribution.status === "confirmed" && <Check className="h-5 w-5 text-success" />}
                              {contribution.status === "pending" && <Clock className="h-5 w-5 text-warning" />}
                              {contribution.status === "processing" && <RefreshCw className="h-5 w-5 text-primary animate-spin" />}
                            </div>
                            <div>
                              <p className="font-medium">{contribution.groupName}</p>
                              <p className="text-sm text-muted-foreground">Cycle {contribution.cycleId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(contribution.amount)}</p>
                            <Badge variant="outline" className={cn(
                              "text-xs capitalize",
                              contribution.status === "confirmed" && "border-success/30 text-success",
                              contribution.status === "pending" && "border-warning/30 text-warning"
                            )}>
                              {contribution.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "payouts" && (
              <motion.div
                key="payouts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-2xl font-bold mb-6">Payouts</h1>
                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No payouts received yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Your next payout is scheduled based on your group position</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "referrals" && (
              <motion.div
                key="referrals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-2xl font-bold mb-6">Referrals</h1>
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Your Referral Code</p>
                        <p className="text-2xl font-bold font-mono">{user.referralCode}</p>
                      </div>
                      <Button variant="outline" onClick={() => {
                        navigator.clipboard.writeText(user.referralCode);
                        toast.success("Referral code copied!");
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold">{user.referralCount}</p>
                        <p className="text-sm text-muted-foreground">Referrals</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold">{formatCurrency(user.referralEarnings)}</p>
                        <p className="text-sm text-muted-foreground">Earnings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-2xl font-bold mb-6">Settings</h1>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive alerts for contributions and payouts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">AI Insights</p>
                        <p className="text-sm text-muted-foreground">Get personalized financial recommendations</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Voice Commands</p>
                        <p className="text-sm text-muted-foreground">Enable voice-controlled features</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* AI Chat */}
      <AIChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} userContext={user} />

      {/* Smart Proof Upload Dialog */}
      <Dialog open={!!selectedContribution} onOpenChange={() => setSelectedContribution(null)}>
        {selectedContribution && (
          <SmartProofUpload
            contribution={selectedContribution}
            onUpload={handleUploadProof}
            onClose={() => setSelectedContribution(null)}
          />
        )}
      </Dialog>

      {/* Group Details Dialog */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        {selectedGroup && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedGroup.name}</DialogTitle>
              <DialogDescription>{selectedGroup.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contribution</p>
                  <p className="font-bold">{formatCurrency(selectedGroup.contributionAmount)} / {selectedGroup.contributionType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Position</p>
                  <p className="font-bold">{selectedGroup.userPosition}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invite Code</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold font-mono">{selectedGroup.inviteCode}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                      navigator.clipboard.writeText(selectedGroup.inviteCode);
                      toast.success("Code copied!");
                    }}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Penalty</p>
                  <p className="font-bold">
                    {selectedGroup.penaltySettings.type === "percentage" 
                      ? `${selectedGroup.penaltySettings.value}%` 
                      : formatCurrency(selectedGroup.penaltySettings.value)}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium mb-2">Members ({selectedGroup.members.length})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedGroup.members.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Pos {member.position}</Badge>
                        {member.hasPaid ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Clock className="h-4 w-4 text-warning" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>Start your own thrift savings group</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Group Name</Label>
              <Input placeholder="Family Savings Circle" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contribution Amount</Label>
                <Input placeholder="50000" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Members</Label>
                <Input placeholder="12" type="number" />
              </div>
              <div className="space-y-2">
                <Label>Total Cycles</Label>
                <Input placeholder="12" type="number" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateGroupOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setCreateGroupOpen(false);
              toast.success("Group created successfully!");
            }}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={joinGroupOpen} onOpenChange={setJoinGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a Group</DialogTitle>
            <DialogDescription>Enter the invite code to join an existing group</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Invite Code</Label>
              <Input placeholder="FAM2024" className="uppercase" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinGroupOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setJoinGroupOpen(false);
              toast.success("Joined group successfully!");
            }}>Join Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================

export default function AjoSyncApp() {
  const [screen, setScreen] = useState<AppScreen>("landing");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    // For demo, we start at landing page
  }, []);

  const handleAuth = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setScreen("landing");
  };

  return (
    <AnimatePresence mode="wait">
      {screen === "landing" && (
        <LandingPage
          key="landing"
          onGetStarted={() => setScreen("auth")}
          onLogin={() => setScreen("auth")}
        />
      )}
      
      {screen === "auth" && (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <AuthScreen onAuth={handleAuth} />
        </motion.div>
      )}
      
      {screen === "dashboard" && user && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col min-h-screen"
        >
          <Dashboard user={user} onLogout={handleLogout} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
