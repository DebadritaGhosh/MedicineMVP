import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Medicine } from "@/types/Medicine";
import { Plus, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MedicineListScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addToCart } = useCart();
  const { user } = useAuth();

  // const categories = [
  //   "all",
  //   "healthcare",
  //   "skincare",
  //   "beauty",
  // ];


  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterMedicines();
  }, [searchQuery, selectedCategory, medicines]);

  const fetchMedicines = async () => {
    try {
      const response = await fetch("https://dummyjson.com/products?limit=50");
      const data = await response.json();

      // Transform products to medicine-like items
      const medicineData: Medicine[] = data.products.map((product: any) => ({
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.thumbnail,
        category: product.category,
        description: product.description,
        rating: product.rating,
        stock: product.stock,
      }));

      // const categoryData: string[] = data.products.map((product: any) => product.category);
      const categoryData: string[] = [
        ...new Set(
          (data.products as { category: string }[]).map(
            (product) => product.category
          )
        ),
      ];

      categoryData.unshift("all");

      setMedicines(medicineData);
      setFilteredMedicines(medicineData);
      setCategories(categoryData);
    } catch (error) {
      Alert.alert("Error", "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  const filterMedicines = () => {
    let filtered = medicines;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          medicine.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (medicine) =>
          medicine.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredMedicines(filtered);
  };

  const handleAddToCart = (medicine: Medicine) => {
    if (!user) {
      Alert.alert("Login Required", "Please login to add items to cart");
      return;
    }
    addToCart(medicine);
    Alert.alert(
      "Added to Cart",
      `${medicine.name} has been added to your cart`
    );
  };

  const renderMedicine = ({ item }: { item: Medicine }) => (
    <View style={styles.medicineCard}>
      <Image source={{ uri: item.image }} style={styles.medicineImage} />
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.medicineDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.medicineFooter}>
          <Text style={styles.medicinePrice}>₹{item.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCategoryFilter = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === item && styles.categoryButtonTextActive,
        ]}
      >
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading medicines...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medicines</Text>
        <Text style={styles.headerSubtitle}>Find your healthcare needs</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#6B7280"
        />
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        renderItem={renderCategoryFilter}
        keyExtractor={(item) => item}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryListContent}
      />

      {/* Medicine List */}
      <FlatList
        data={filteredMedicines}
        renderItem={renderMedicine}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.medicineList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  categoryList: {
    marginBottom: 16,
  },
  categoryListContent: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    height: 30,
  },
  categoryButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  categoryButtonTextActive: {
    color: "#FFFFFF",
  },
  medicineList: {
    padding: 16,
  },
  medicineCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medicineImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#F3F4F6",
  },
  medicineInfo: {
    padding: 12,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  medicineDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
  },
  medicineFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  medicinePrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10B981",
  },
  addButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
