import React from 'react';
import { 
  HeartIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CogIcon,
  BellIcon,
  UserGroupIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  PrinterIcon,
  ArrowDownTrayIcon as DownloadIcon,
  ArrowUpTrayIcon as UploadIcon,
  ArrowPathIcon as RefreshIcon,
  HomeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

import {
  HeartIcon as HeartSolid,
  UserIcon as UserSolid,
  CalendarIcon as CalendarSolid,
  ClockIcon as ClockSolid,
  ChartBarIcon as ChartBarSolid,
  ShieldCheckIcon as ShieldCheckSolid,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon as InformationSolid
} from '@heroicons/react/24/solid';

import {
  FaUserDoctor,
  FaHospital,
  FaUserNurse,
  FaHeart
} from 'react-icons/fa6';

import {
  Activity,
  Thermometer,
  Pill,
  Stethoscope,
  Brain,
  Bone,
  Eye,
  Ear,
  Heart,
  Wind,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  User,
  Users,
  FileText,
  Search,
  Settings,
  Bell,
  Phone,
  Mail,
  MapPin,
  Home,
  Building,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Plus,
  Minus,
  Edit,
  Trash2,
  Download,
  Upload,
  Share,
  Printer,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// Healthcare-specific icon components
export const HealthcareIcons = {
  // Medical Equipment
  Stethoscope: ({ className, ...props }) => <Stethoscope className={className} {...props} />,
  Thermometer: ({ className, ...props }) => <Thermometer className={className} {...props} />,
  Syringe: ({ className, ...props }) => <Plus className={className} {...props} />,
  XRay: ({ className, ...props }) => <Eye className={className} {...props} />,
  Microscope: ({ className, ...props }) => <Search className={className} {...props} />,
  
  // Body Parts & Health
  Heart: ({ className, ...props }) => <Heart className={className} {...props} />,
  Brain: ({ className, ...props }) => <Brain className={className} {...props} />,
  Lungs: ({ className, ...props }) => <Wind className={className} {...props} />,
  Bone: ({ className, ...props }) => <Bone className={className} {...props} />,
  Eye: ({ className, ...props }) => <Eye className={className} {...props} />,
  Ear: ({ className, ...props }) => <Ear className={className} {...props} />,
  
  // Medical Professionals
  Doctor: ({ className, ...props }) => <FaUserDoctor className={className} {...props} />,
  Nurse: ({ className, ...props }) => <FaUserNurse className={className} {...props} />,
  
  // Facilities
  Hospital: ({ className, ...props }) => <FaHospital className={className} {...props} />,
  Clinic: ({ className, ...props }) => <Building className={className} {...props} />,
  HomeCare: ({ className, ...props }) => <Home className={className} {...props} />,
  
  // Medications & Treatment
  Pills: ({ className, ...props }) => <Pill className={className} {...props} />,
  Prescription: ({ className, ...props }) => <FileText className={className} {...props} />,
  Medkit: ({ className, ...props }) => <Plus className={className} {...props} />,
  Bandage: ({ className, ...props }) => <Shield className={className} {...props} />,
  
  // Vital Signs & Monitoring
  Heartbeat: ({ className, ...props }) => <FaHeart className={className} {...props} />,
  Activity: ({ className, ...props }) => <Activity className={className} {...props} />,
  Pulse: ({ className, ...props }) => <Zap className={className} {...props} />,
  Weight: ({ className, ...props }) => <Activity className={className} {...props} />,
  Height: ({ className, ...props }) => <Activity className={className} {...props} />,
  Temperature: ({ className, ...props }) => <Thermometer className={className} {...props} />,
  
  // Emergency & Accessibility
  Ambulance: ({ className, ...props }) => <Plus className={className} {...props} />,
  Wheelchair: ({ className, ...props }) => <User className={className} {...props} />,
  Emergency: ({ className, ...props }) => <AlertTriangle className={className} {...props} />,
  
  // Lab & Testing
  Vials: ({ className, ...props }) => <Plus className={className} {...props} />,
  LabTest: ({ className, ...props }) => <Search className={className} {...props} />,
  
  // Trends & Analytics
  TrendUp: ({ className, ...props }) => <TrendingUp className={className} {...props} />,
  TrendDown: ({ className, ...props }) => <TrendingDown className={className} {...props} />,
  Chart: ({ className, ...props }) => <ChartBarIcon className={className} {...props} />
};

// Standard UI Icons
export const UIIcons = {
  // Navigation
  Calendar: ({ className, ...props }) => <Calendar className={className} {...props} />,
  Clock: ({ className, ...props }) => <Clock className={className} {...props} />,
  User: ({ className, ...props }) => <User className={className} {...props} />,
  Users: ({ className, ...props }) => <Users className={className} {...props} />,
  Home: ({ className, ...props }) => <Home className={className} {...props} />,
  Building: ({ className, ...props }) => <Building className={className} {...props} />,
  
  // Actions
  Plus: ({ className, ...props }) => <Plus className={className} {...props} />,
  Minus: ({ className, ...props }) => <Minus className={className} {...props} />,
  Edit: ({ className, ...props }) => <Edit className={className} {...props} />,
  Delete: ({ className, ...props }) => <Trash2 className={className} {...props} />,
  Search: ({ className, ...props }) => <Search className={className} {...props} />,
  Settings: ({ className, ...props }) => <Settings className={className} {...props} />,
  
  // Communication
  Phone: ({ className, ...props }) => <Phone className={className} {...props} />,
  Mail: ({ className, ...props }) => <Mail className={className} {...props} />,
  Bell: ({ className, ...props }) => <Bell className={className} {...props} />,
  
  // Documents
  File: ({ className, ...props }) => <FileText className={className} {...props} />,
  Download: ({ className, ...props }) => <Download className={className} {...props} />,
  Upload: ({ className, ...props }) => <Upload className={className} {...props} />,
  Print: ({ className, ...props }) => <Printer className={className} {...props} />,
  Share: ({ className, ...props }) => <Share className={className} {...props} />,
  
  // Status & Feedback
  CheckCircle: ({ className, ...props }) => <CheckCircle className={className} {...props} />,
  XCircle: ({ className, ...props }) => <XCircle className={className} {...props} />,
  AlertTriangle: ({ className, ...props }) => <AlertTriangle className={className} {...props} />,
  Info: ({ className, ...props }) => <Info className={className} {...props} />,
  
  // Security
  Shield: ({ className, ...props }) => <Shield className={className} {...props} />,
  Lock: ({ className, ...props }) => <Lock className={className} {...props} />,
  Unlock: ({ className, ...props }) => <Unlock className={className} {...props} />,
  
  // Arrows & Navigation
  ArrowRight: ({ className, ...props }) => <ArrowRight className={className} {...props} />,
  ArrowLeft: ({ className, ...props }) => <ArrowLeft className={className} {...props} />,
  ChevronRight: ({ className, ...props }) => <ChevronRight className={className} {...props} />,
  ChevronLeft: ({ className, ...props }) => <ChevronLeft className={className} {...props} />,
  ChevronUp: ({ className, ...props }) => <ChevronUp className={className} {...props} />,
  ChevronDown: ({ className, ...props }) => <ChevronDown className={className} {...props} />,
  
  // Utility
  Refresh: ({ className, ...props }) => <RefreshCw className={className} {...props} />,
  MapPin: ({ className, ...props }) => <MapPin className={className} {...props} />
};

// Export all icons in one object for easy access
export const Icons = {
  ...HealthcareIcons,
  ...UIIcons
};

export default Icons;