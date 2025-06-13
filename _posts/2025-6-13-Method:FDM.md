---
title: 有限差分法求解LDC
description: >-
  这是顶盖驱动方腔流的有限差分方法概述.
author: Chunfeng Fusu
date: 2025-06-13 11:41:32 +0800
categories: [lid-driven-cavity]
tags: [有限差分(FDM)]
math: true
pin: true

---
## 顶盖驱动方腔流有限差分法求解步骤

### 1. 问题定义与控制方程

首先，明确我们要解决的问题：一个二维方形腔体，其顶部盖板以恒定速度$$ U $$水平移动，其余三壁静止。流体为不可压缩牛顿流体。



**控制方程**（无量纲形式[见《FDM:量纲与无量纲》]({% post_url 2025-6-13-FDM:量纲与无量纲 %})，雷诺数 \(Re = \frac{UL}{\nu}\)）：

- **x-动量方程**:
  $$
  \frac{\partial u}{\partial t} + u\frac{\partial u}{\partial x} + v\frac{\partial u}{\partial y} = -\frac{\partial p}{\partial x} + \frac{1}{Re}\left(\frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2}\right)
  $$

- **y-动量方程**:
  $$
  \frac{\partial v}{\partial t} + u\frac{\partial v}{\partial x} + v\frac{\partial v}{\partial y} = -\frac{\partial p}{\partial y} + \frac{1}{Re}\left(\frac{\partial^2 v}{\partial x^2} + \frac{\partial^2 v}{\partial y^2}\right)
  $$

- **连续性方程**:
  $$
  \frac{\partial u}{\partial x} + \frac{\partial v}{\partial y} = 0
  $$

其中，$u, v$ 分别是 $x, y$ 方向的速度分量，$p$ 是压力，$t$ 是时间，$Re$ 是雷诺数。

### 2. 计算域离散化 (网格生成)

- 将正方形计算域划分为 $N_x \times N_y$ 个均匀的网格单元。
- 网格点 $(i,j)$ 对应物理坐标 $(x_i, y_j)$，其中 $x_i = i \cdot \Delta x$，$y_j = j \cdot \Delta y$。
- $\Delta x = L_x / N_x$ 和 $\Delta y = L_y / N_y$ 是网格间距。
- 速度分量 $u, v$ 和压力 $p$ 通常定义在相同的网格节点上（同位网格），或者 $u, v$ 定义在单元格面中心，$p$ 定义在单元格中心（交错网格）。为简单起见，这里假设同位网格。

### 3. 控制方程的有限差分离散

使用有限差分近似替换偏导数，[具体差分推导见《FDM:差分推导》]({% post_url 2025-6-13-FDM:差分推导 %})。

- **时间导数** (一阶向前差分):
  $$
  \frac{\partial u}{\partial t} \approx \frac{u_{i,j}^{n+1} - u_{i,j}^{n}}{\Delta t}
  $$
  其中上标 $n$ 表示时间层，$n+1$ 表示下一个时间层，$\Delta t$ 是时间步长。

- **空间一阶导数** (中心差分):
  $$
  \frac{\partial u}{\partial x} \Big|_{i,j} \approx \frac{u_{i+1,j} - u_{i-1,j}}{2\Delta x}
  $$
  $$
  \frac{\partial u}{\partial y} \Big|_{i,j} \approx \frac{u_{i,j+1} - u_{i,j-1}}{2\Delta y}
  $$    
    
注意：对流项有时会使用迎风格式以增强稳定性

- **空间二阶导数** (中心差分):
  $$
  \frac{\partial^2 u}{\partial x^2} \Big|_{i,j} \approx \frac{u_{i+1,j} - 2u_{i,j} + u_{i-1,j}}{(\Delta x)^2}
  $$
  $$
  \frac{\partial^2 u}{\partial y^2} \Big|_{i,j} \approx \frac{u_{i,j+1} - 2u_{i,j} + u_{i,j-1}}{(\Delta y)^2}
  $$

将这些差分格式代入动量方程，得到每个网格点 $(i,j)$ 上的代数方程。

### 4. 压力-速度耦合 (Projection Method / Fractional Step Method)

由于压力没有独立的控制方程，且速度和压力通过连续性方程耦合，需要特殊处理。常用的投影法步骤如下：

**步骤 4.1: 求解中间速度场 (不含压力梯度项)**

首先，忽略压力梯度项，或者使用上一时间步的压力，求解一个中间速度场 $(u^*, v^*)$：

- x-动量:
  $$
  \frac{u_{i,j}^* - u_{i,j}^n}{\Delta t} = - \left( u\frac{\partial u}{\partial x} + v\frac{\partial u}{\partial y} \right)_{i,j}^n + \frac{1}{Re}\left(\frac{\partial^2 u}{\partial x^2} + \frac{\partial^2 u}{\partial y^2}\right)_{i,j}^n
  $$
  (右端项使用 $n$ 时刻的值进行显式计算)

- y-动量:
  $$
  \frac{v_{i,j}^* - v_{i,j}^n}{\Delta t} = - \left( u\frac{\partial v}{\partial x} + v\frac{\partial v}{\partial y} \right)_{i,j}^n + \frac{1}{Re}\left(\frac{\partial^2 v}{\partial x^2} + \frac{\partial^2 v}{\partial y^2}\right)_{i,j}^n
  $$



**步骤 4.2: 压力泊松方程 (Pressure Poisson Equation, PPE)**


中间速度场 $(u^*, v^*)$ 通常不满足连续性方程。通过引入压力修正[见《FDM:压力泊松方程》]({% post_url 2025-6-13-FDM:压力泊松方程 %})，使得校正后的速度场 $(u^{n+1}, v^{n+1})$ 满足连续性。
速度校正公式为：
$$
\frac{u_{i,j}^{n+1} - u_{i,j}^*}{\Delta t} = -\frac{\partial p^{n+1}}{\partial x} \Big|_{i,j}
$$
$$
\frac{v_{i,j}^{n+1} - v_{i,j}^*}{\Delta t} = -\frac{\partial p^{n+1}}{\partial y} \Big|_{i,j}
$$

将校正后的速度代入离散化的连续性方程 $\frac{\partial u^{n+1}}{\partial x} + \frac{\partial v^{n+1}}{\partial y} = 0$，得到压力泊松方程：
$$
\left( \frac{\partial^2 p}{\partial x^2} + \frac{\partial^2 p}{\partial y^2} \right)^{n+1}_{i,j} = \frac{1}{\Delta t} \left( \frac{\partial u^*}{\partial x} + \frac{\partial v^*}{\partial y} \right)_{i,j}
$$
右端项是中间速度场的散度，作为源项。**这个椭圆型偏微分方程**需要求解得到 $p^{n+1}$。

**步骤 4.3: 速度校正**

得到新的压力场 $p^{n+1}$ 后，用它来校正中间速度场，得到 $n+1$ 时刻的速度场：
$$
u_{i,j}^{n+1} = u_{i,j}^* - \Delta t \left( \frac{p_{i+1,j}^{n+1} - p_{i-1,j}^{n+1}}{2\Delta x} \right)
$$
$$
v_{i,j}^{n+1} = v_{i,j}^* - \Delta t \left( \frac{p_{i,j+1}^{n+1} - p_{i,j-1}^{n+1}}{2\Delta y} \right)
$$

### 5. 边界条件的应用

- **速度边界条件**:
    - 顶盖 ($y=L_y$): $u = U_{lid}$, $v = 0$
    - 底壁 ($y=0$): $u = 0$, $v = 0$
    - 左壁 ($x=0$): $u = 0$, $v = 0$
    - 右壁 ($x=L_x$): $u = 0$, $v = 0$
    这些条件直接施加在边界网格点上。

- **压力边界条件 (针对压力泊松方程)**:
    通常使用 Neumann 边界条件 (法向压力梯度为零或由动量方程导出)。例如，在固壁上，可以将法向动量方程应用于边界，得到压力的法向导数。
    一个常见的简化是：$\frac{\partial p}{\partial n} = 0$ (法向压力梯度为零)。
    例如，在左壁 ($i=0$): $\frac{p_{1,j} - p_{-1,j}}{2\Delta x} = 0 \implies p_{-1,j} = p_{1,j}$ (通过引入虚拟节点)。或者，更直接地，从法向动量方程在边界上的离散形式推导。

### 6. 求解代数方程组

- **压力泊松方程**：离散后形成一个大型稀疏线性代数方程组 $A \mathbf{p} = \mathbf{b}$。可以使用迭代法求解，如：
    - Jacobi 方法
    - Gauss-Seidel 方法
    - Successive Over-Relaxation (SOR) 方法
    - 更高级的方法如共轭梯度法 (CG) 或多重网格法 (Multigrid)

### 7. 迭代求解流程 (时间推进)

1.  **初始化**: 设置初始速度场 $(u^0, v^0)$ 和压力场 $p^0$ (例如，全部为零)。
2.  **时间循环**: 对于每个时间步 $n=0, 1, 2, \dots$ 直到达到稳态或预设的模拟时间：  
    a.  **根据边界条件更新边界上的速度值**。  
    b.  **计算中间速度** $u^*, v^*$ (步骤 4.1)。  
    c.  **求解压力泊松方程** 得到 $p^{n+1}$ (步骤 4.2)。  这通常需要一个内部迭代循环直到压力场收敛。  
    d.  **校正速度场** 得到 $u^{n+1}, v^{n+1}$ (步骤 4.3)。
    e.  检查收敛性：如果求解稳态问题，可以检查速度场或残差的变化是否小于某个容差。例如，$\max(|u^{n+1}-u^n|) < \epsilon$。
    f.  更新时间: $t = t + \Delta t$。如果达到稳态或最终时间，则停止。

### 8. 后处理

- 当计算收敛或达到指定时间后，可以输出和可视化结果，如：
    - 速度矢量图
    - 流线图
    - 压力等值线图
    - 涡量云图
    - 特定位置（如中心线）的速度剖面

### 9. 数值稳定性与精度

- **时间步长 $\Delta t$** 的选择受CFL (Courant-Friedrichs-Lewy) 条件和扩散数条件的限制，以保证显式格式的稳定性。
  $$
  CFL = \max\left(\frac{|u|\Delta t}{\Delta x}, \frac{|v|\Delta t}{\Delta y}\right) \le C_{max} \quad (\text{通常 } C_{max} \approx 1)
  $$
  $$
  D = \frac{\nu \Delta t}{(\Delta x)^2} + \frac{\nu \Delta t}{(\Delta y)^2} \le D_{max} \quad (\text{通常 } D_{max} \approx 0.25 - 0.5 \text{ for explicit schemes})
  $$
- **网格雷诺数**: $Re_{\Delta x} = \frac{u \Delta x}{\nu}$。如果过大，中心差分对流项可能导致非物理振荡，此时可能需要迎风格式或更细的网格。
- **精度**: 通常为 $\mathcal{O}(\Delta t, \Delta x^2, \Delta y^2)$，取决于所用差分格式的阶数。

---

这些步骤构成了使用有限差分法求解顶盖驱动方腔流问题的基本框架。具体的实现细节（如对流项的离散格式、压力泊松方程的求解器选择）可能会有所不同。
