import {
  Loader2,
  Mail,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { IconType } from "react-icons";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export const Icons = {
  spinner: Loader2,
  google: FcGoogle as IconType,
  gitHub: FaGithub as IconType,
  mail: Mail,
  externalLink: ExternalLink,
  checkCircle: CheckCircle,
  xCircle: XCircle,
} as const; 