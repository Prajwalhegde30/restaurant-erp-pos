'use client';

import { useState } from 'react';
import { useSearchCustomers, useCustomerLoyalty, Customer } from '../../hooks/useCustomers';
import { usePosStore } from '../../store/posStore';
import { Input, Button, Card, Badge } from '@repo/ui';

export function CustomerSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { activeCustomerId, activeCustomerName, setActiveCustomer } = usePosStore();

  // Search Query
  const { data: searchResults, isLoading: searchLoading } = useSearchCustomers(
    isSearching && query.length >= 3 ? query : '',
  );

  // Loyalty details for the active customer
  const { data: loyaltyData, isLoading: loyaltyLoading } = useCustomerLoyalty(activeCustomerId);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsSearching(true);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setActiveCustomer(customer.id, `${customer.firstName} ${customer.lastName}`);
    setQuery('');
    setIsSearching(false);
  };

  const handleClearCustomer = () => {
    setActiveCustomer(null, null);
    setQuery('');
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-muted/20 border-b">
      {activeCustomerId ? (
        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold">{activeCustomerName}</div>
              <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                {loyaltyLoading ? (
                  <span>Loading loyalty...</span>
                ) : loyaltyData ? (
                  <>
                    <Badge variant="secondary" className="text-[10px]">
                      {loyaltyData.tier}
                    </Badge>
                    <span className="flex items-center text-primary font-medium">
                      {loyaltyData.pointsBalance} pts
                    </span>
                  </>
                ) : null}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCustomer}
              className="h-6 px-2 text-xs"
            >
              Remove
            </Button>
          </div>
        </Card>
      ) : (
        <div className="relative">
          <Input
            placeholder="Search customer by name or phone..."
            value={query}
            onChange={handleSearch}
            className="w-full text-sm"
          />
          {isSearching && query.length >= 3 && (
            <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto">
              {searchLoading ? (
                <div className="p-2 text-sm text-muted-foreground">Searching...</div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="flex flex-col">
                  {searchResults.map((customer) => (
                    <button
                      key={customer.id}
                      className="text-left p-2 hover:bg-muted text-sm border-b last:border-b-0 flex justify-between"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <span>
                        {customer.firstName} {customer.lastName}
                      </span>
                      <span className="text-muted-foreground text-xs">{customer.phone}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-2 text-sm text-muted-foreground">No customers found.</div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
