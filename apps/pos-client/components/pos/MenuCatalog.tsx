'use client';

import { useState } from 'react';
import { useCategories, useMenuItems } from '../../hooks/useCatalog';
import { usePosStore } from '../../store/posStore';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  Button,
  Skeleton,
  EmptyState,
} from '@repo/ui';
import { LayoutGrid } from 'lucide-react';

export function MenuCatalog({ branchId }: { branchId: string }) {
  const { activeTableId, addItem } = usePosStore();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const { data: categories, isLoading: catsLoading } = useCategories(branchId);
  const categoriesList = categories || [];

  // Initialize active tab if null
  if (!activeCategoryId && categoriesList.length > 0) {
    setActiveCategoryId(categoriesList[0].id);
  }

  const { data: items, isLoading: itemsLoading } = useMenuItems(activeCategoryId);
  const itemsList = items || [];

  if (!activeTableId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground">
        Select a table to start ordering
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden h-full">
      {catsLoading ? (
        <div className="flex gap-2 w-full mb-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      ) : (
        <Tabs
          value={activeCategoryId || ''}
          onValueChange={setActiveCategoryId}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="w-full justify-start overflow-x-auto shrink-0">
            {categoriesList.map((cat: { id: string; name: string }) => (
              <TabsTrigger key={cat.id} value={cat.id} className="px-6">
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto pt-4 min-h-0">
            {itemsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card
                    key={i}
                    className="overflow-hidden flex flex-col h-full border-zinc-200 dark:border-zinc-800"
                  >
                    <Skeleton className="h-32 w-full rounded-none" />
                    <CardContent className="p-4 flex flex-col flex-1 gap-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex justify-between items-center mt-auto pt-4">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                {itemsList.map(
                  (item: {
                    id: string;
                    name: string;
                    image?: string | null;
                    isAvailable: boolean;
                    description?: string | null;
                    basePrice: number;
                  }) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden flex flex-col h-full border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 group cursor-pointer"
                    >
                      <div className="h-32 bg-muted flex items-center justify-center relative overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs uppercase tracking-widest">
                            No Image
                          </span>
                        )}
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center font-bold text-destructive">
                            SOLD OUT
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex flex-col flex-1">
                        <h4 className="font-bold mb-1 leading-tight">{item.name}</h4>
                        <div className="text-sm text-muted-foreground flex-1 line-clamp-2 mb-2">
                          {item.description}
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-bold">${Number(item.basePrice).toFixed(2)}</span>
                          <Button
                            size="sm"
                            disabled={!item.isAvailable}
                            onClick={() =>
                              addItem({
                                menuItemId: item.id,
                                name: item.name,
                                price: Number(item.basePrice),
                                quantity: 1,
                              })
                            }
                          >
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
                {itemsList.length === 0 && (
                  <div className="col-span-full py-12">
                    <EmptyState
                      icon={LayoutGrid}
                      title="No items found"
                      description="This category currently has no menu items assigned to it."
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </Tabs>
      )}
    </div>
  );
}
