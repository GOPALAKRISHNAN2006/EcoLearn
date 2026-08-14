import React, { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  ShoppingBag,
  Shirt,
  BookOpen,
  Backpack,
  Film,
  UtensilsCrossed,
  Gift,
  Award,
  Coins,
  Trophy,
  Star,
  CheckCircle,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingUp
} from 'lucide-react';
import { getStudentRewards, redeemReward } from '../../services/gameRewardsService';
import { toast } from 'sonner';

const RewardsStore = () => {
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redemptionHistory, setRedemptionHistory] = useState([]);

  const rewardItems = [
    // High-tier rewards (9000-10000 coins)
    {
      id: 'laptop-sleeve',
      name: 'EcoLearn Laptop Sleeve',
      description: 'Premium laptop sleeve with eco-friendly materials',
      price: 9600,
      category: 'accessories',
      icon: Backpack,
      image: '💼',
      color: 'from-purple-500 to-pink-600',
      discount: '15% off on eco-products',
      stock: 'Limited Edition'
    },
    {
      id: 'exclusive-kit',
      name: 'Exclusive EcoLearn Kit',
      description: 'T-shirt, keychain, and  Bag',
      price: 9400,
      category: 'merchandise',
      icon: Gift,
      image: '🎁',
      color: 'from-red-500 to-orange-600',
      discount: 'Complete merch set',
      stock: 'Premium'
    },

    // Premium rewards (6000-7500 coins)
    {
      id: 'premium-tshirt',
      name: 'EcoLearn Premium T-Shirt',
      description: 'High-quality t-shirt with exclusive EcoLearn design',
      price: 7200,
      category: 'merchandise',
      icon: Shirt,
      image: '👕',
      color: 'from-emerald-500 to-cyan-600',
      discount: '20% off stationery',
      stock: 'In Stock'
    },
    {
      id: 'cap',
      name: 'EcoLearn Cap',
      description: 'Stylish cap available in black or white',
      price: 6500,
      category: 'accessories',
      icon: Award,
      image: '🧢',
      color: 'from-blue-500 to-cyan-600',
      discount: 'Comes in 2 colors',
      stock: 'In Stock'
    },
    // Mid-tier rewards (3000-5000 coins)
    {
      id: 'backpack',
      name: 'Eco-Friendly Backpack',
      description: 'Sustainable backpack made from recycled materials',
      price: 4500,
      category: 'accessories',
      icon: Backpack,
      image: '🎒',
      color: 'from-green-500 to-emerald-600',
      discount: '10% off next purchase',
      stock: 'In Stock'
    },
    {
      id: 'stationery-set',
      name: 'Premium Stationery Set',
      description: 'Complete set with notebooks, pens, and eco-supplies',
      price: 3000,
      category: 'stationery',
      icon: BookOpen,
      image: '✏️',
      color: 'from-yellow-500 to-orange-600',
      discount: 'Eco-friendly materials',
      stock: 'In Stock'
    },

    // Low-tier rewards (1000-2500 coins)
    {
      id: 'food-voucher-500',
      name: 'Food Voucher ₹500',
      description: 'Swiggy/Zomato food delivery voucher',
      price: 2500,
      category: 'food',
      icon: UtensilsCrossed,
      image: '🍔',
      color: 'from-red-500 to-pink-600',
      discount: '₹500 credit',
      stock: 'E-Voucher'
    },
    {
      id: 'notebook-bundle',
      name: 'Eco Notebook Bundle (5 pcs)',
      description: 'Set of 5 recycled paper notebooks',
      price: 2000,
      category: 'stationery',
      icon: BookOpen,
      image: '📓',
      color: 'from-teal-500 to-cyan-600',
      discount: 'Recycled paper',
      stock: 'In Stock'
    },
    {
      id: 'food-voucher-250',
      name: 'Food Voucher ₹250',
      description: 'Swiggy/Zomato food delivery voucher',
      price: 1500,
      category: 'food',
      icon: UtensilsCrossed,
      image: '🍕',
      color: 'from-orange-500 to-red-500',
      discount: '₹250 credit',
      stock: 'E-Voucher'
    },
    {
      id: 'pen-set',
      name: 'Eco Pen Set (10 pcs)',
      description: 'Biodegradable pens in assorted colors',
      price: 1000,
      category: 'stationery',
      icon: Award,
      image: '🖊️',
      color: 'from-blue-500 to-indigo-600',
      discount: 'Eco-friendly ink',
      stock: 'In Stock'
    },
  ];

  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingBag },
    { id: 'merchandise', name: 'Merchandise', icon: Shirt },
    { id: 'courses', name: 'Courses', icon: BookOpen },
    { id: 'stationery', name: 'Stationery', icon: Award },
    { id: 'accessories', name: 'Accessories', icon: Backpack },
    { id: 'entertainment', name: 'Entertainment', icon: Film },
    { id: 'food', name: 'Food & Dining', icon: UtensilsCrossed },
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.error('No student data found');
        return;
      }

      const student = JSON.parse(userData);
      const studentId = student._id || student.id;
      const response = await getStudentRewards(studentId);

      if (response.success) {
        setCoins(response.data.coins || 0);
        setLevel(response.data.level || 1);
        setRedemptionHistory(response.data.redemptions || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = (item) => {
    if (coins < item.price) {
      toast.error('Insufficient coins! Keep playing games to earn more.');
      return;
    }
    setSelectedItem(item);
    setShowConfirmDialog(true);
  };

  const confirmRedemption = async () => {
    if (!selectedItem) return;

    setRedeeming(true);
    try {
      const userData = localStorage.getItem('user');
      const student = JSON.parse(userData);
      const studentId = student._id || student.id;

      const response = await redeemReward(studentId, {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        coinsSpent: selectedItem.price,
        category: selectedItem.category
      });

      if (response.success) {
        setCoins(coins - selectedItem.price);
        toast.success(`🎉 Successfully redeemed ${selectedItem.name}!`);
        setShowConfirmDialog(false);
        setSelectedItem(null);
        fetchUserData(); // Refresh data
      } else {
        toast.error(response.message || 'Redemption failed');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? rewardItems 
    : rewardItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a3a2e] to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a3a2e] to-slate-900">
      <Navigation />

      <main className="pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-3 mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-[#f59e0b]/20 rounded-full border border-[#f59e0b]/30">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-[#f59e0b]" />
              <span className="text-[#f59e0b] font-semibold text-sm sm:text-base lg:text-lg">Rewards Store</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#f59e0b] via-yellow-400 to-orange-400 bg-clip-text text-transparent mb-3 sm:mb-4 px-4">
              Redeem Your Coins
            </h1>
            <p className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-4">
              Exchange your hard-earned game coins for exciting rewards!
            </p>
          </div>

          {/* User Stats Card */}
          <Card className="bg-slate-800/80 border-slate-700 mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Coins className="w-8 h-8 sm:w-12 sm:h-12 text-[#f59e0b] mx-auto mb-2" />
                  <p className="text-slate-400 text-xs sm:text-sm">Your Coins</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">24</p>
                </div>
                <div className="text-center">
                  <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs sm:text-sm">Level</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{level}</p>
                </div>
                <div className="text-center">
                  <ShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs sm:text-sm">Redeemed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{redemptionHistory.length}</p>
                </div>
                <div className="text-center">
                  <Star className="w-8 h-8 sm:w-12 sm:h-12 text-cyan-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs sm:text-sm">Earn Rate</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">10/game</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Earn More Coins Info */}
          <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-500/20 p-3 rounded-full flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-2">How to Earn Coins</h3>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• Complete quiz challenges: <span className="text-emerald-400 font-semibold">10 coins</span> per quiz</li>
                  <li>• Play educational games: <span className="text-emerald-400 font-semibold">10 coins</span> per game</li>
                  <li>• Daily login bonus: <span className="text-emerald-400 font-semibold">5 coins</span></li>
                  <li>• Complete assignments: <span className="text-emerald-400 font-semibold">20 coins</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className={`${
                  selectedCategory === category.id
                    ? 'bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-white'
                    : 'bg-slate-800/50 hover:bg-slate-700 text-slate-300 border-slate-700'
                } text-xs sm:text-sm`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const canAfford = coins >= item.price;
              const ItemIcon = item.icon;

              return (
                <Card
                  key={item.id}
                  className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                    canAfford
                      ? 'bg-slate-800/50 border-slate-700 hover:border-[#f59e0b]/50 hover:shadow-xl hover:shadow-[#f59e0b]/20'
                      : 'bg-slate-800/30 border-slate-800 opacity-75'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <CardContent className="p-4 sm:p-6 relative">
                    {/* Item Image/Icon */}
                    <div className="text-6xl mb-4 text-center">{item.image}</div>
                    
                    {/* Stock Badge */}
                    <Badge className="absolute top-4 right-4 bg-slate-700 text-white text-xs">
                      {item.stock}
                    </Badge>

                    {/* Item Details */}
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{item.name}</h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    {/* Discount/Benefit */}
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-xs">{item.discount}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-[#f59e0b]" />
                        <span className="text-2xl font-bold text-white">{item.price.toLocaleString()}</span>
                      </div>
                      {!canAfford && (
                        <span className="text-red-400 text-xs">Need {(item.price - coins).toLocaleString()}</span>
                      )}
                    </div>

                    {/* Redeem Button */}
                    <Button
                      className={`w-full ${
                        canAfford
                          ? 'bg-gradient-to-r from-[#f59e0b] to-orange-600 hover:from-[#f59e0b]/90 hover:to-orange-700 text-white'
                          : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      }`}
                      onClick={() => handleRedeemClick(item)}
                      disabled={!canAfford}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {canAfford ? 'Redeem Now' : 'Insufficient Coins'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* No Items Message */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No items in this category</p>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              Confirm Redemption
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="py-4">
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <div className="text-4xl text-center mb-3">{selectedItem.image}</div>
                <h3 className="text-white font-bold text-lg text-center mb-2">{selectedItem.name}</h3>
                <p className="text-slate-400 text-sm text-center mb-3">{selectedItem.description}</p>
                <div className="flex items-center justify-center gap-2 text-[#f59e0b]">
                  <Coins className="w-5 h-5" />
                  <span className="text-xl font-bold">{selectedItem.price.toLocaleString()} coins</span>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Current Balance:</span>
                  <span className="text-white font-semibold">{coins.toLocaleString()} coins</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">After Redemption:</span>
                  <span className="text-emerald-400 font-semibold">{(coins - selectedItem.price).toLocaleString()} coins</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
              disabled={redeeming}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRedemption}
              className="bg-gradient-to-r from-[#f59e0b] to-orange-600 hover:from-[#f59e0b]/90 hover:to-orange-700 text-white"
              disabled={redeeming}
            >
              {redeeming ? 'Redeeming...' : 'Confirm Redeem'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardsStore;
