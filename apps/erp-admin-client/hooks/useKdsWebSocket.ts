import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken } from '../lib/auth';
import { useKdsStore, KdsTicket, OrderStatus } from '../store/useKdsStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002';

export function useKdsWebSocket(branchId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const { addOrUpdateTicket, updateTicketStatus } = useKdsStore();

  useEffect(() => {
    if (!branchId) return;

    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      return;
    }

    // Initialize Socket.IO connection
    const socket = io(WS_URL, {
      auth: {
        token,
      },
      query: {
        branchId,
      },
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('KDS WebSocket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('KDS WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
      }
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      setIsConnected(false);
      console.error('KDS WebSocket connection error:', err);
    });

    // Listen for new tickets
    socket.on('KitchenTicketCreated', (payload: KdsTicket) => {
      console.log('Received KitchenTicketCreated:', payload);
      // In a real implementation, you might need to send an ACK here
      // socket.emit('ack', { eventId: payload.id });
      addOrUpdateTicket(payload);
    });

    // Listen for order modifications (items added/removed)
    socket.on('OrderModified', (payload: KdsTicket) => {
      console.log('Received OrderModified:', payload);
      addOrUpdateTicket(payload);
    });

    // Listen for order status changes (e.g. Cancelled)
    socket.on('OrderStatusUpdated', (payload: { orderId: string; status: OrderStatus }) => {
      console.log('Received OrderStatusUpdated:', payload);
      updateTicketStatus(payload.orderId, payload.status);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [branchId, addOrUpdateTicket, updateTicketStatus]);

  return { isConnected, error, socket: socketRef.current };
}
