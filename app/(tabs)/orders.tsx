import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types/Medicine';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, Package } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";


export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('orders');
      if (storedOrders) {
        const allOrders: Order[] = JSON.parse(storedOrders);
        // Filter orders for current user
        const userOrders = user 
          ? allOrders.filter(order => order.userId === user.id)
          : [];
        setOrders(userOrders.reverse()); // Show newest first
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <View style={styles.orderMeta}>
            <Calendar size={14} color="#6B7280" />
            <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.orderTotal}>
          <Text style={styles.totalAmount}>₹{item.total.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.orderItems}>
        <Text style={styles.itemsTitle}>Items ({item.items.length}):</Text>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.itemName} numberOfLines={1}>
              {orderItem.name}
            </Text>
            <Text style={styles.itemQuantity}>x{orderItem.quantity}</Text>
            <Text style={styles.itemPrice}>
              ₹{(orderItem.price * orderItem.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderEmptyOrders = () => (
    <View style={styles.emptyContainer}>
      <Package size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <Text style={styles.emptySubtitle}>
        Your order history will appear here once you make your first purchase
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order History</Text>
        <Text style={styles.headerSubtitle}>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </Text>
      </View>

      {orders.length === 0 && !loading ? (
        renderEmptyOrders()
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  orderTotal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 4,
  },
  orderItems: {
    
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 12,
    minWidth: 30,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    minWidth: 60,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});