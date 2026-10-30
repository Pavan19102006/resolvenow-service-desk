import React from 'react';
import {
  X,
  Layers,
  Shield,
  Database,
  Server,
  Bell,
  Cpu,
  ArrowRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { getBaseUrl } from '../services/api';

export default function ArchitectureModal({ isOpen, onClose }) {
  const [copiedEndpoint, setCopiedEndpoint] = React.useState(null);

  if (!isOpen) return null;

  const baseUrl = getBaseUrl();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(text);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const services = [
    {
      name: 'API Gateway',
      port: '8080 / 10000',
      role: 'Single Entrypoint, Ingress Routing, Global CORS & JWT Filter',
      tech: 'Spring Cloud Gateway, WebFlux Netty',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300'
    },
    {
      name: 'Auth Service',
      port: '8081 (/auth)',
      role: 'User Registration, BCrypt Hashing, JWT Issuance & Validation',
      tech: 'Spring Security, JJWT 0.12.3',
      color: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300'
    },
    {
      name: 'Complaint Service',
      port: '8082 (/complaints)',
      role: 'Grievance Lifecycle & Auto-Call Assignment Service',
      tech: 'Spring Data JPA, Hibernate, PostgreSQL',
      color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300'
    },
    {
      name: 'Assignment Service',
      port: '8083 (/assignments)',
      role: 'Smart Department Auto-Routing & Auto-Call Notification Service',
      tech: 'Spring Boot, Department Allocation Engine',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
    },
    {
      name: 'Notification Service',
      port: '8084 (/notifications)',
      role: 'Customer Alerts, Unread Tracking & Status Update Broadcasts',
      tech: 'Spring Data JPA, Event Notification Queue',
      color: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
    },
    {
      name: 'Eureka Registry',
      port: '8761 (/eureka)',
      role: 'Service Discovery, Health Heartbeats & Dynamic Routing',
      tech: 'Spring Cloud Netflix Eureka',
      color: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
    }
  ];

  const endpoints = [
    { method: 'POST', path: '/auth/register', desc: 'Register user' },
    { method: 'POST', path: '/auth/login', desc: 'Login & obtain JWT' },
    { method: 'POST', path: '/complaints', desc: 'Create complaint (triggers Auto-Assignment)' },
    { method: 'GET', path: '/complaints', desc: 'List all complaints' },
    { method: 'PUT', path: '/complaints/{id}/status', desc: 'Update complaint status' },
    { method: 'GET', path: '/assignments/complaint/{id}', desc: 'View assignment details' },
    { method: 'GET', path: '/notifications/user/{id}', desc: 'Fetch user notifications' },
    { method: 'PUT', path: '/notifications/{id}/read', desc: 'Mark notification as read' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                ResolveNow Microservices Architecture
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Level 5 Architecture Design & Pipeline Specifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Architecture Flow Diagram */}
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-2">
              End-to-End Microservice Chain Flow
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-2 text-center text-[11px]">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm w-full md:w-32">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Frontend</span>
                <span className="text-[10px] text-slate-400">React + Vite</span>
              </div>
              <ArrowRight className="h-4 w-4 text-indigo-500 transform rotate-90 md:rotate-0 flex-shrink-0" />
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 shadow-sm w-full md:w-36">
                <span className="font-extrabold block">API Gateway</span>
                <span className="text-[10px] text-indigo-500">JWT Verification</span>
              </div>
              <ArrowRight className="h-4 w-4 text-indigo-500 transform rotate-90 md:rotate-0 flex-shrink-0" />
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 shadow-sm w-full md:w-36">
                <span className="font-extrabold block">Complaint Service</span>
                <span className="text-[10px] text-blue-500">Auto-routes Dept</span>
              </div>
              <ArrowRight className="h-4 w-4 text-indigo-500 transform rotate-90 md:rotate-0 flex-shrink-0" />
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-sm w-full md:w-36">
                <span className="font-extrabold block">Assignment Service</span>
                <span className="text-[10px] text-emerald-500">Assigns Agent</span>
              </div>
              <ArrowRight className="h-4 w-4 text-indigo-500 transform rotate-90 md:rotate-0 flex-shrink-0" />
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-sm w-full md:w-36">
                <span className="font-extrabold block">Notification</span>
                <span className="text-[10px] text-amber-500">Alerts Customer</span>
              </div>
            </div>
          </div>

          {/* Microservices Breakdown Grid */}
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-2">
              Individual Microservices Specifications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {services.map((s) => (
                <div key={s.name} className={`p-3.5 rounded-2xl border ${s.color}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{s.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/70 dark:bg-black/40">
                      {s.port}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-tight mb-2">{s.role}</p>
                  <span className="text-[10px] font-mono opacity-70 block">{s.tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* REST API Endpoints Quick Reference */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                REST Endpoints Cheatsheet (Live Backend: {baseUrl})
              </h4>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              {endpoints.map((ep) => (
                <div
                  key={ep.path + ep.method}
                  className="px-3 py-2 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`font-mono font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        ep.method === 'POST'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          : ep.method === 'PUT'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
                      {ep.path}
                    </span>
                    <span className="text-slate-400 text-[10px] hidden sm:inline">— {ep.desc}</span>
                  </div>

                  <button
                    onClick={() => handleCopy(`${baseUrl}${ep.path}`)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Copy full URL"
                  >
                    {copiedEndpoint === `${baseUrl}${ep.path}` ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
