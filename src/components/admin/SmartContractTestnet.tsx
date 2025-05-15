
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { smartContractService } from "@/services/smartContractService";
import { getContractTemplate } from "@/utils/contractTemplates";
import {
  FileCode,
  ArrowUpRight,
  Copy,
  RefreshCcw,
  CheckCircle,
  XCircle,
  ArrowRight,
  Download,
  ExternalLink,
  Eye,
  Code
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

import { useNavigate } from 'react-router-dom';

const SmartContractTestnet = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContract, setSelectedContract] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [contractCode, setContractCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = () => {
    setIsLoading(true);
    
    // Load contracts from service
    const contracts = smartContractService.getTestnetContracts();
    
    setTimeout(() => {
      setContracts(contracts);
      setIsLoading(false);
    }, 500);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Program ID copied to clipboard");
    
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleRefresh = () => {
    loadContracts();
    toast.success("Contract list refreshed");
  };

  const handleDeployToMainnet = (contract: any) => {
    setSelectedContract(contract);
    
    // Redirect to deployment environment page
    navigate('/admin/environment', { 
      state: { contractName: contract.name, programId: contract.programId }
    });
    
    toast.success(`${contract.name} selected for mainnet deployment`, {
      description: "Redirecting to deployment environment"
    });
  };

  const handleNewDeployment = () => {
    navigate('/admin/deployment');
  };

  const handleViewContractDetails = (contract: any) => {
    setSelectedContract(contract);
    // Get the contract code from the contract type
    if (contract.contractType) {
      setContractCode(getContractTemplate(contract.contractType, contract.programId));
    } else {
      setContractCode(`// No source code available for ${contract.name}`);
    }
    setShowContractDetails(true);
  };

  const handleDownloadContract = (contract: any) => {
    let code = '';
    if (contract.contractType) {
      code = getContractTemplate(contract.contractType, contract.programId);
    } else {
      code = `// No source code available for ${contract.name}`;
    }
    
    const fileName = `${contract.name.toLowerCase().replace(/\s+/g, '_')}.rs`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success(`Contract source code downloaded as ${fileName}`);
  };

  const handleViewTransactionDetails = (txHash: string) => {
    const explorerUrl = `https://explorer.solana.com/tx/${txHash}?cluster=testnet`;
    window.open(explorerUrl, '_blank');
  };

  const filteredContracts = contracts.filter(contract =>
    contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.programId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileCode className="text-orange-500" size={22} />
            Testnet Smart Contracts
          </h2>
          <p className="text-gray-400 text-sm">Smart contracts deployed to testnet and ready for production</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="h-9 text-xs" 
            onClick={handleRefresh}
          >
            <RefreshCcw size={14} className="mr-1" />
            Refresh
          </Button>
          
          <Button 
            className="bg-orange-500 hover:bg-orange-600 h-9 text-xs" 
            onClick={handleNewDeployment}
          >
            <FileCode size={14} className="mr-1" />
            Deploy Contract
          </Button>
        </div>
      </div>
      
      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search by name or program ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/30"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-20">
          <RefreshCcw size={24} className="animate-spin text-wybe-primary" />
        </div>
      ) : (
        <div className="glass-card rounded-lg overflow-hidden">
          {filteredContracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-white/5">
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Program ID</TableHead>
                  <TableHead className="text-white">Network</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Deployed</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract, index) => (
                  <TableRow 
                    key={index} 
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileCode size={14} className="text-orange-500" />
                        {contract.name}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <span>
                          {`${contract.programId.substring(0, 8)}...${contract.programId.substring(
                            contract.programId.length - 8
                          )}`}
                        </span>
                        <button
                          onClick={() => handleCopyId(contract.programId)}
                          className="text-gray-400 hover:text-white"
                        >
                          {copiedId === contract.programId ? (
                            <CheckCircle size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                        {contract.network}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {contract.status === 'active' ? (
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                          <span>Inactive</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{contract.deployDate}</span>
                        <button 
                          className="text-gray-400 hover:text-blue-400" 
                          title="View transaction"
                          onClick={() => handleViewTransactionDetails(contract.txHash)}
                        >
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30"
                          onClick={() => handleViewContractDetails(contract)}
                        >
                          <Eye size={12} className="mr-1" />
                          View Code
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30"
                          onClick={() => handleDownloadContract(contract)}
                        >
                          <Download size={12} className="mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30"
                          onClick={() => handleDeployToMainnet(contract)}
                        >
                          <ArrowUpRight size={12} className="mr-1" />
                          To Mainnet
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <XCircle size={40} className="mx-auto mb-4 text-gray-500 opacity-20" />
              <p className="text-gray-400">No contracts found</p>
              <p className="text-gray-500 text-sm mt-1">Try deploying a contract first</p>
              <Button
                className="mt-4 bg-orange-500 hover:bg-orange-600"
                onClick={handleNewDeployment}
              >
                <ArrowRight size={14} className="mr-1" />
                Go to Deployment
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Contract Details Dialog */}
      <Dialog open={showContractDetails} onOpenChange={setShowContractDetails}>
        <DialogContent className="max-w-4xl bg-black/90 border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Code className="text-orange-500" />
              {selectedContract?.name} Source Code
            </DialogTitle>
            <DialogDescription>
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-gray-400">Program ID: {selectedContract?.programId}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Deployed on: {selectedContract?.deployDate}</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-black/50 rounded-md p-4 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                Rust
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => selectedContract && handleDownloadContract(selectedContract)}
              >
                <Download size={12} className="mr-1" />
                Download Source
              </Button>
            </div>
            <pre className="overflow-x-auto bg-black/30 p-4 rounded-md max-h-[500px] overflow-y-auto">
              <code className="text-xs font-mono whitespace-pre text-white">
                {contractCode}
              </code>
            </pre>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://explorer.solana.com/address/${selectedContract?.programId}?cluster=testnet`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <ExternalLink size={12} className="mr-1" />
                View on Explorer
              </a>
            </Button>
            
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="ghost" size="sm">Close</Button>
              </DialogClose>
              <Button 
                className="bg-orange-500 hover:bg-orange-600" 
                size="sm"
                onClick={() => selectedContract && handleDeployToMainnet(selectedContract)}
              >
                <ArrowUpRight size={12} className="mr-1" />
                Deploy to Mainnet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>Need help with contract deployment? Visit the <a href="/admin/guide" className="text-orange-400 hover:underline">Master Deployment Guide</a>.</p>
      </div>
    </motion.div>
  );
};

export default SmartContractTestnet;
