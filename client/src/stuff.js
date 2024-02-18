export const lorenIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In mollis massa a ante eleifend, at malesuada odio lobortis. Vivamus lobortis, nunc ut egestas rhoncus, est tortor dignissim est, nec congue nunc velit sed arcu. Sed sed accumsan risus. Etiam faucibus accumsan fermentum. In mattis interdum velit, ac tincidunt libero. Nunc suscipit dui nunc, vitae tempor orci euismod nec. Curabitur tristique quis lorem eu lobortis. Morbi odio lorem, porta id pretium commodo, vestibulum eu lacus. Mauris luctus sagittis augue, ac finibus orci auctor in. Pellentesque arcu tortor, vestibulum placerat sollicitudin vitae, accumsan nec magna. Cras molestie nisl tellus, vitae iaculis mi elementum vitae. Sed at malesuada dolor.

Aenean eget justo egestas, faucibus turpis eu, euismod est. In hac habitasse platea dictumst. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec blandit erat lacus, nec suscipit eros bibendum nec. Nullam vitae neque turpis. Praesent vel efficitur neque. Sed dignissim urna porttitor nisi cursus eleifend.

Vivamus ut ultricies sapien. Cras fringilla placerat maximus. Maecenas eget varius nulla, sed varius purus. Maecenas vestibulum, eros non faucibus eleifend, odio lacus vehicula lectus, vitae vestibulum dui tellus sollicitudin ex. Integer dapibus, justo at mollis porttitor, leo risus dapibus magna, vitae bibendum mi magna sed leo. Nam fringilla dolor ac massa pulvinar placerat. Nullam sit amet eleifend lectus. Maecenas eleifend nibh quis cursus convallis. Nam ut vehicula ante, vitae eleifend urna.

Nam pellentesque nulla vel risus cursus rutrum. Mauris blandit et orci non ultrices. Integer feugiat ex id neque faucibus, at fermentum dolor gravida. Proin metus nunc, eleifend nec pulvinar sit amet, faucibus vel metus. Sed rutrum ut erat id lacinia. Ut egestas sapien at ipsum gravida, dignissim aliquet nibh iaculis. Proin libero felis, condimentum ut eleifend non, euismod et odio. Curabitur auctor odio nec nisl vehicula, finibus dapibus nisi sodales. Phasellus cursus eget ligula a ultricies. Fusce eget erat risus.

Cras vitae aliquet est. Aliquam lorem libero, dignissim ut elit eget, aliquam ultrices magna. Quisque hendrerit leo ut sodales finibus. Praesent vestibulum risus at viverra euismod. Pellentesque lobortis turpis dictum mi condimentum, sed fringilla nisi sagittis. Fusce quis sodales libero. Phasellus nec hendrerit dolor. Aliquam sagittis euismod lorem, eget tincidunt mauris rutrum non. In luctus vitae tellus sed faucibus. Quisque in gravida massa, accumsan fermentum massa. Aliquam faucibus quis erat eget maximus. Vivamus molestie nulla nec facilisis tempor.`;

export const examplePaperUrl = "https://arxiv.org/pdf/2401.01335v2.pdf";

export const examplePaperText =
  `Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models
Zixiang Chen∗†  Yihe Deng∗‡  Huizhuo Yuan∗§   Kaixuan Ji¶  Quanquan Gu



Abstract
Harnessing the power of human-annotated data through Supervised Fine-Tuning (SFT) is pivotal for advancing Large Language Models (LLMs). In this paper, we delve into the prospect of growing a strong LLM out of a weak one without the need for acquiring additional human- annotated data. We propose a new fine-tuning method called Self-Play fIne-tuNing (SPIN), which starts from a supervised fine-tuned model. At the heart of SPIN lies a self-play mechanism, where the LLM refines its capability by playing against instances of itself. More specifically, the LLM generates its own training data from its previous iterations, refining its policy by discerning these self-generated responses from those obtained from human-annotated data. Our method progressively elevates the LLM from a nascent model to a formidable one, unlocking the full potential of human-annotated demonstration data for SFT. Theoretically, we prove that the global optimum to the training objective function of our method is achieved only when the LLM policy aligns with the target data distribution. Empirically, we evaluate our method on several benchmark datasets including the HuggingFace Open LLM Leaderboard, MT-Bench, and datasets from Big-Bench. Our results show that SPIN can significantly improve the LLM’s performance across a variety of benchmarks and even outperform models trained through direct preference optimization (DPO) supplemented with extra GPT-4 preference data. This sheds light on the promise of self-play, enabling the achievement of human-level performance in LLMs without the need for expert opponents. Codes are available at https://github.com/uclaml/SPIN.
1  Introduction
Large Language Models (LLMs) have began a groundbreaking era in artificial general intelligence (AGI), demonstrating extraordinary capabilities across a wide range of domains that require in- tricate reasoning and specialized knowledge. These models excel in areas such as mathematical reasoning/problem solving (Cobbe et al., 2021; Wei et al., 2022; Lewkowycz et al., 2022), code gener- ation/programming (Chen et al., 2021; Austin et al., 2021; Li et al., 2022), text generation (Bubeck
∗Equal contribution
†Department of Computer Science,  University of California,  Los Angeles,  CA 90095,  USA; e-mail:
chenzx19@cs.ucla.edu
‡Department of Computer Science,  University of California,  Los Angeles,  CA 90095,  USA; e-mail:
yihedeng@cs.ucla.edu
§Department of Computer Science,  University of California,  Los Angeles,  CA 90095,  USA; e-mail:
hzyuan@cs.ucla.edu
¶Department of Computer Science,  University of California,  Los Angeles,  CA 90095,  USA; e-mail:
kaixuanji@cs.ucla.edu
Department of Computer Science, University of California, Los Angeles, CA 90095, USA; e-mail: qgu@cs.ucla.edu

1

et al., 2023; Anil et al., 2023; Touvron et al., 2023), summarization and creative writing, among others. A significant advancement in LLMs is the post-pretraining alignment with the more de- sirable behaviors (Mishra et al., 2021; Victor et al., 2022; Chung et al., 2022; Thoppilan et al., 2022), a process often reliant on the costly human-annotated data. Typical alignment methods include Supervised Fine-Tuning (SFT) (Ouyang et al., 2022; Tunstall et al., 2023a) based on human demonstrations, and Reinforcement Learning from Human Feedback (RLHF) (Christiano et al., 2017; Ziegler et al., 2019; Stiennon et al., 2020; Bai et al., 2022a) based on human preferences.
All the aforementioned alignment methods require a substantial volume of human annotated data. Therefore, there is increasing interest in developing fine-tuning methods that can effectively utilize human data, thereby streamlining the alignment process. This motivates us to study fine-tuning LLMs without the need for additional human-annotated data beyond the fine-tuning dataset. Our study is also related to the broader goal of converting weak models to strong models without the requirement for extra training data, which is of central interest in machine learning that can be traced back to the boosting algorithms (Kearns and Valiant, 1994; Schapire, 1990; Freund, 1995; Freund and Schapire, 1997). The self-training algorithm (Vapnik, 1999; Grandvalet and Bengio, 2004; Lee, 2013) has also been proved to be able to convert weak learners to strong learners in mixture models without the need for additional labeled data (Frei et al., 2022; Kou et al., 2022). However, the pursuit of autonomously enhancing a weak LLM without external guidance is both intriguing and understudied. This raises the following question:
Can we empower a weak LLM to improve itself without acquiring additional human annotated data?
In this paper, we answer this question affirmatively. Inspired by the success of self-play mecha- nisms (Samuel, 2000) in games, exemplified by AlphaGo Zero (Silver et al., 2017b), AlphaZero (Silver et al., 2017a), with historical roots traced back to TD-Gammon (Tesauro et al., 1995), we propose to convert a weak LLM to a strong one through the lens of self-play, where the model is enhanced by playing against itself without requiring any direct supervision. In particular, we propose a novel fine-tuning method called Self-Play fIne-tuNing (SPIN), which begins from a supervised fine-tuned model. SPIN allows the LLM to engage in self-play, eliminating the need for an expert annotator such as a human or more advanced LLMs like GPT-4. In detail, with the LLM from previous iteration t denoted by pθ , we employ it to generate responses y′ to the prompts x in the human-annotated SFT dataset. The subsequent objective is to find a new LLM pθt+1 , capable of distinguishing the
responses y′ generated by pθ from the responses y generated by humans. This process can be seen
as a two-player game: the main player, or the new LLM pθt+1 , seeks to discern between the responses of the opponent player pθt and human-generated responses, while the opponent, or the old LLM pθt , generates responses as similar as possible to those in the human-annotated SFT dataset. The new LLM pθt+1 is obtained by fine-tuning the old one pθt to prefer responses from pdₐtₐ over pθt , resulting in a distribution pθt+1 that is more aligned with pdₐtₐ. In the next iteration, the newly obtained LLM pθt+1 becomes the opponent for response generation, with the self-play process aiming for the LLM to eventually converge to pθ∗ = pdₐtₐ, so that the strongest possible LLM can no longer differentiate the responses generated by its previous version and those generated by the human.
Interestingly, our method exhibits similarity with the recently introduced direct preference optimization (DPO) method (Rafailov et al., 2023), with the notable distinction being the self-play nature of our method. Consequently, our approach stands out by eliminating the need for extra human preference data, a requirement present in the DPO method. Additionally, the self-play mechanism in our method resembles the idea of generative adversarial networks (GAN) (Goodfellow

2

et al., 2014; Arjovsky et al., 2017), albeit that both the discriminator (main player) and the generator (the opponent) in our method are instances of the same LLM from different iterations. Theoretically, we prove that our method converges when the distribution of the LLM is identical to the target data distribution, i.e., pθt = pdₐtₐ. Our experimental results on zephyr-7b-sft-full (Tunstall et al., 2023a), a fine-tuned LLM based on Mistral-7B (Jiang et al., 2023), show that while continued training using SFT on its own SFT dataset Ultrachat200k (Ding et al., 2023) reaches a performance plateau or even diminished evaluation scores, our method consistently improves zephyr-7b-sft-full across successive iterations while leveraging only a 50k subset of Ultrachat200k dataset. Ultimately, SPIN effectively improves the base model’s average score from 58.14 to 63.16 on the HuggingFace Open LLM Leaderboard (Beeching et al., 2023) with remarkable 10%+ improvement in scores on GSM8k and TruthfulQA, and from 5.94 to 6.78 on MT-Bench (Zheng et al., 2023). Notably, SPIN achieves results that are even comparable to models trained on additional 62k preference dataset (Tunstall et al., 2023a) on Open LLM leaderboard and MT-Bench.
Concurrent to our work, Singh et al. (2023) proposed the use of synthetic data with binary feedback in self-training, reducing the reliance on human data. In contrast, our approach eliminates the need for additional binary feedback from humans or an extra reward model thanks to the self-play mechanism. Additionally, Burns et al. (2023) employed a weak LLM model as the guidance to train stronger LLMs in a fashion of weak-to-strong generation. Unlike Burns et al. (2023), which necessitates both a weak supervisor and a strong model, our SPIN operates effectively with a single LLM.
Notation. We use lowercase letters and lowercase boldface letters to denote scalars and vectors, respectively. We use [N ] to denote the index set {1, . . . , N }. In the function space, let F be the function class. The symbol qdₐtₐ designates the target data distribution, while p represents the conditional probability of LLM’s response (i.e., LLM policy).
2  Related Work
Self-Play. Self-play (Samuel, 1959; Tesauro et al., 1995), where the algorithm learns by playing against itself, has gained notable attention due to its effectiveness in multi-agent reinforcement learn- ing (MARL). This method involves agents engaging in interactions with copies of themselves, enabling an increasing level of challenge and complexity within the learning environment. A fundamental work in the field of self-play is AlphaGo Zero (Silver et al., 2017b), which demonstrated exceptional performance against human players using a self-play learning scheme. Subsequent research has expanded upon the concept of self-play, exploring various adaptations and implementations (Anthony et al., 2017; Lanctot et al., 2017; Bansal et al., 2018; Hernandez-Leal et al., 2018; Muller et al., 2019; Vinyals et al., 2019). Our method takes the self-play approach akin to AlphaGo Zero, which can convert a weak model to a strong one without additional human-annotated data. While the effectiveness of self-play in MARL is well-established, to our knowledge, our work is the first to apply this approach to the enhancement of LLMs.
Synthetic Data for LLMs.  In the context of supervised fine-tuning (SFT) of LLMs, human- crafted data has proven to be a remarkably effective source that enhances the performance of LLMs on tasks such as code generation (Roziere et al., 2023; Yang et al., 2023) and mathematical reasoning (Yuan et al., 2023; Luo et al., 2023). While human data typically exhibits high quality, acquiring sufficient amount of such data poses a challenge in cost. In light of this consideration, the use of synthetic data has become increasingly popular and considered as a proxy for human data. This approach primarily leverages advanced LLMs such as the GPT series (Radford et al., 2019;

3

Brown et al., 2020; OpenAI, 2023) as the guidance to generate high-quality data (Josifoski et al., 2023; Taori et al., 2023; Chiang et al., 2023; Li et al., 2023). Recent research has also highlighted the rephrasing capability of LLMs in prompting for better LLM response (Deng et al., 2023; Prasad et al., 2023) as well as augmenting synthetic data for more effective SFT (Yu et al., 2023; Liu et al., 2023). In contrast to prior studies that utilized more advanced models for synthetic data generation when pre-training or fine-tuning a target model, our approach directly generates synthetic data from the target model itself.
3  Problem Setting and Preliminaries
We consider a Large Language Model (LLM) parameterized by θ and denoted by pθ. The model takes as input a sequence x = [x₁, . . . , xn], commonly referred to as the prompt, to generate the corresponding response y = [y₁, . . . , ym]. The response y is therefore considered as a sample from the conditional probability distribution pθ(·|x). In LLMs, xi and yj represent individual tokens from a predetermined vocabulary within the sequences x and y, respectively. The auto- regressive model pθ generates tokens sequentially for a given position, leveraging only the sequence of previously generated tokens. This model therefore constitutes a Markov process, where the conditional probability distribution pθ(y|x) can be expressed through a decomposition as follows:
m
pθ(y|x) =  pθ(yj|x, y<j),
j=1
where y<₁ is null and y<j = [y₁, . . . , yj−₁] for j = 2, . . . , m. In the following, we review two major fine-tuning methods for LLMs: supervised fine-tuning and reinforcement learning (RL) fine-tuning.
3.1  Supervised Fine-Tuning
Supervised fine-tuning (SFT) is employed to tailor a pre-trained LLM to specific downstream tasks, leveraging relatively smaller dataset of labeled examples in comparison to the large-scale pre-training data (Ouyang et al., 2022; Yu et al., 2023). In this context, we consider a specific task where the prompts, denoted by x, are derived from a specified distribution q(·). The notation pdₐtₐ(·|x) then represents the probability distribution of the associated high-quality responses y from the training data. Consequently, SFT involves training the LLM to minimize the following negative log-likelihood loss associated with these distributions,
LSFT(θ) = −Ex∼q(·),y∼pdata(·|x)h log pθ y|x i. (3.1)
It should be noted that excluding x ∼ q(·) from the expectation term yields the typical cross- entropy loss, expressed as −Ey∼pdata(·|x)[log pθ(y|x)]. LSFT(θ) attains its minimum when the model’s predictive distribution pθ(y|x) aligns perfectly with the distribution of the labeled high-quality responses pdₐtₐ(y|x).
Consequently, the LLM after SFT is anticipated to generate responses that closely resemble those from pdₐtₐ(y|x). This procedure is therefore expected to significantly enhance the model’s performance in generating appropriate responses for a specific task.
3.2  RL Fine-Tuning
RL fine-tuning (Christiano et al., 2017; Bai et al., 2022a; Gao et al., 2023a) offers another method for enhancing the specific capabilities of general-purpose pre-trained models. Typically, RL fine-tuning is employed subsequent to SFT to achieve improved alignment for LLMs (Tunstall et al., 2023a).

4

For a given sequence pair (x, y), RL fine-tuning necessitates a deterministic reward function r(x, y). The higher the reward r(x, y), the better the response y is to the given prompt x. The objective of the RL fine-tuning process is then to maximize the following objective function:
LRL(θ) = Ex∼q(·),y∼pθ (·|x)[r(x, y)] − λEx∼q(·)KL pθ(·|x)||prₑf (·|x) ,
where the Kullback-Leibler (KL) regularization enforces the new model pθ to be close to the reference model prₑf , and λ > 0 is the regularization parameter to control the deviation of the new model pθ from the reference model prₑf . In practice, the reference model prₑf is often initialized as the supervised fine-tuned model. The inclusion of KL regularization is vital for preventing excessive deviation from the reference model, which in turn reduces the risk of mode collapse.
Meanwhile, the primary challenge in RL fine-tuning lies in finding a good reward function. Typically, this function requires training on a preference dataset. The compilation of such a dataset demands significant resources, often involving comprehensive evaluations either by human annotators, i.e., reinforcement learning from human feedback (RLHF) (Christiano et al., 2017; Bai et al., 2022a) or strong AI agents, i.e., reinforcement learning from AI feedback (RLAIF) (Bai et al., 2022b).
4  Method
In this section, we introduce a new fine-tuning method for enhancing the performance of LLMs without relying on additional human or AI feedback. Consider a high-quality supervised fine-tuning
(SFT) dataset SSFT = {(x, y)}ⁿ , which are sampled from the marginal distribution q(x) and
pdₐtₐ(y|x). Given a supervised fine-tuned LLM pθ0 , further application of the SFT approach in (3.1) with SSFT will be ineffective and potentially lead to worse performance. In addition, without human and/or AI feedback, it becomes infeasible to acquire a preference dataset for RL fine-tuning (e.g., RLHF and RLAIF). This hinders the application of RL fine-tuning techniques.
We evaluate pθ0 against SSFT, where pθ0 is the LLM achieved by SFT using (3.1). We notice a persistent quality gap between the groundtruth response y from SSFT and the LLM-generated response y′ ∼ pθ(·|x) (refer to Figure 1). This disparity indicates that there is still room for improvement over pθ0 . Therefore, we propose to use the synthetic data generated by the LLM to enhance LLM’s performance starting from pθ0 iteratively.
4.1  Self-Play Fine-Tuning (SPIN)
Let us consider a two-player game, where the main player’s objective is to distinguish the responses generated by the LLM and those generated by the human. Meanwhile, the opponent’s role is to generate responses that are indistinguishable from the human’s responses. The core of our method is the self-play mechanism, where both the main player and the opponent are the same LLM, but from different iterations. More specifically, the opponent is the old LLM from the previous iteration, and the main player is the new LLM to be learned in the current iteration.
In iteration t + 1, the opponent is the LLM from the previous iteration, denoted by pθt , which generates responses y′ for those prompts x in the SFT dataset according to pθ (·|x). Our method, therefore, consists of the following two steps at iteration t + 1: (1) training the main player, and (2) updating the opponent player.
Training the Main Player. We begin with illustrating how we expect a main player is trained to distinguish LLM responses from human responses. Motivated by integral probability metric (IPM) (Müller, 1997), we formulate our objective function such that the main player ft₊₁ maximizes the


5

Chosen: ground truth completion              Rejected: model generation @Iter 0

In Southampton, what is the most popular form of transportation for commuters?
I don't have access to current data. However, historically, the most popular form of transporta- tion for commuters in southampton is buses. The city also has a good network of trains and taxis.
In Southampton, what is the most popular form of transportation for commuters?
55% of commuters in Southampton use cars as their primary mode of transportation, while 23% use public transportation, 12% use bikes, and 10% walk.
Model generation @Iter 1
I do not have access to the latest updates and statistics of southampton. However, based on previous reports, the most popular form of transportation for commuters in southampton is the public transport network, which includes buses, trains, and ferries. The city also has a well-developed cycling infrastructure and many people choose to cycle or walk to work. Additionally, private cars and taxis are also commonly used for commuting.

Figure 1: Example of ground truth completion compared to the fine-tuned model generation at iteration 0 and 1. We can observe that the model generation at iteration 0, although fluent, incorrectly quantifies transportation preferences with specific percentages that are potentially hallucinations. The model generation at iteration 1 provides a qualitative summary of the transportation forms at Southampton without specific percentage, aligning more closely with the ground truth while adding more details.

expected value gap between the target data distribution pdₐtₐ and the opponent player’s distribution
pθt :


ft+1 = argmax Ex∼q(·),y∼p
f ∈Ft


data

(·|x),y′∼pθt
₍·|ₓ₎ f (x, y) − f (x, y′) ,      (4.1)
where Ft is a sequence of highly expressive function classes that we will determine in later deduction. The subscript t in Ft is due to that the function class is dependent on pθt . Given such a ft₊₁ and a response sequence y to the prompt x, the value of ft₊₁(x, y) reflects the main player’s degree of belief that y originates from pdₐtₐ rather than pθt . Ideally, the main player ft₊₁ should yield a
high value when y ∼ pdₐtₐ(·|x) and a low value when y′ ∼ pθ (·|x), where pθ is the opponent’s
distribution. Instead of solving (4.1), we can also solve the following more general optimization
problem,

ft+1 = argmin Ex∼q(·),y∼p
f ∈Ft


data

(·|x),y′∼pθt
₍·|ₓ₎ ℓ f (x, y) − f (x, y′) ,      (4.2)
where ℓ(·) is a loss function that is both monotonically decreasing and convex. For example, a linear loss function ℓ(t) = −t reduces (4.2) to the minimization version of (4.1). However, the use of a linear loss function results in an unbounded objective value, which, during continuous training, leads to a negative infinite value of f (x, y′) on the opponent player’s responses. Therefore, in our work, we choose the logistic loss function ℓ(t) := log(1 + exp(−t)) for its non-negativity, smoothness, and exponentially decaying tail as t → ∞. Such a choice of loss function aids in preventing the excessive growth in the absolute value of f .
Updating the Opponent Player. Previously we have discussed the training of ft₊₁ given the opponent player’s distribution pθt . Now suppose we have optimized our main player ft₊₁ that can distinguish pdₐtₐ from pθt , within a certain function class Ft, we elaborate how we get parameter θt₊₁

6

of the opponent player. Specifically, when presented with two responses y and y′ to the same prompt x, ft₊₁ assesses the values ft₊₁(x, y) and ft₊₁(x, y′). It then infers that the response with the higher value is from the real data distribution pdₐtₐ and the response with lower value is attributed to the LLM pθt . Subsequently, the objective of the opponent player is to find a better LLM that generates responses indistinguishable from pdₐtₐ for the main player. This is achieved by maximizing the expected value Ex∼q(·),y∼p(·|x)[ft₊₁(x, y)]. In addition, to prevent excessive deviation of pθt+1 from pθt and stabilize the self-play, we incorporate a Kullback-Leibler (KL) regularization term. Putting these together gives rise to the following optimization problem:
argmax Ex∼q(·),y∼p(·|x)[ft₊₁(x, y)] − λEx∼q(·)KL p(·|x)||pθt (·|x) , (4.3)
where λ > 0 is the regularization parameter. Notably, (4.3) has a closed-form solution p(·|x):
p(y|x) ∝ pθ (y|x) exp λ−¹ft₊₁(x, y) . (4.4)
It is worth noting that p(·|x) is not guaranteed to be belong to the LLM space {pθ(·|x)|θ ∈ Θ}. Since we hope that the closed-form solution p^ in the probability space can be realized by an LLM
 
ft₊₁(x, y) = λ · log  ᵖθ (·|x) . This suggests the following function class Ft for ft₊₁:
θt
F =  λ · log pθ (y|x) θ ∈ Θ , (4.5)

where Θ is the parameter space of LLMs being considered. Given the choice of Ft in (4.5), optimizing (4.2) gives ft₊₁ parameterized by θt₊₁ in the following form:


ft+1
(x, y) = λ · log pθt+1 (y|x) . (4.6)
pθt (y|x)
Substituting (4.6) into (4.4) yields p(y|x) = pθt+1 (y|x). In other words, θt₊₁ learned from (4.2) is exactly the LLM parameter for our ideal opponent selection.
End-to-end Training Objective.  We integrate the previously discussed two steps into a single end-to-end training objective with an update rule of θt₊₁. Specifically, plugging (4.5) into (4.2) arrives at the update rule θt₊₁ = argminθ∈Θ LSPIN(θ, θt), where LSPIN is the training objective defined as follows
pθ(y|x)    pθ(y′|x) 

LSPIN(θ, θt) = Ex∼q(·),y∼pdₐtₐ(·|x),y′∼pθ (·|x) ℓ
λ log
pθt
− λ log
(y|x)    pθt
(y′|x)
. (4.7)
We summarize the iterative self-play process of our method SPIN as follows,


. . .  →   pθt
(·|x)
→  λ · log pθt+1 (·|x)

→   pθt+1
(·|x)
→  . . .

Oppon` +
  "`" +
  `ent˛P¸layxer at t
pθt (·|x)
` +
  "`" +
  `Main Pla˛y¸er at t + x1
Oppon` +
  "`" +
  `ent P˛l¸ayer xat t + 1
Namely, the opponent player chosen from the previous iteration t is employed to train the main player at iteration t + 1, resulting in the LLM parameterized by θt₊₁. Then we determine the next opponent player at iteration t + 1 by directly copying the LLM parameter θt₊₁, which is then used in training the main player at iteration t + 2. The detailed algorithm is presented in Algorithm 1.

7

Algorithm 1 Self-Play Fine-Tuning (SPIN)
Input: {(xi, yi)}i∈[N ]: SFT Dataset, pθ0 : LLM with parameter θ₀, T : Number of iterations.
for t = 0, . . . , T − 1 do
for i = 1, . . . N do
Generate synthetic data y′ ∼ pθ (·|xi).

end for
Update θ


t+1

= argminθ∈Θ
i
Σi∈[N ]
t

 pθ(yi|xi)
pθ (yi|xi)


′
i
pθ (y′ |xi)

end for Output: θT .
t           t  i

Remark 4.1. (4.7) bears resemblance to direct preference optimization (DPO) (Rafailov et al., 2023) for RL fine-tuning. However, SPIN exhibits significant distinctions with DPO. Specifically, SPIN is applied to supervised fine-tuning (SFT) and relies solely on the SFT dataset, represented by pairs (x, y). In sharp contrast, DPO is designed for RL fine-tuning and necessitates a preference dataset, represented by (x, yw, yl), where yw and yl denote the winner (chosen) and loser (rejected) responses, respectively. DPO demands that, at the instance level, yw is superior to yl. In comparison, our method requires that, at the distribution level, the target pdₐtₐ should be distinguishable from the weak LLM pθ before it becomes a strong one. In terms of algorithm design, DPO implements a single-iteration approach, while our method facilitates an iterative self-play strategy, as outlined in Algorithm 1.

5  Theoretical Analysis
In this section, we provide a theoretical analysis for Algorithm 1 in Section 4. Under monotonicity and convexity assumption of the objective function ℓ, we show that the global optimum is obtained if and only if parameter θt generates data distribution. We summarize our assumptions as follows:
Assumption 5.1. The loss function ℓ(t) : R → R is monotonically decreasing, i.e., ∀t, ℓ′(t) ≤ 0 and satisfies ℓ′(0) < 0. In addition, ℓ(t) is a convex function.
Assumption 5.1 holds for a wide range of loss functions commonly used in machine learning, including correlation loss ℓ(t) = 1 − t, hinge loss ℓ(t) = max(0, 1 − t), exponential loss ℓ(t) = exp(−t) and logistic loss ℓ(t) = log(1 + exp(−t)). Under Assumptions 5.1, we present the following theorem, which is pivotal in understanding the optimization dynamics of our method.
Theorem 5.2. Under Assumption 5.1, suppose there exists pθ(·|x) = pdₐtₐ(·|x), then we have that
• (Sufficiency) If pθt (·|x) = pdₐtₐ(·|x), then θt is the global minimum of (4.7) for any λ ≥ 0.
• (Necessity) If pθt (·|x) ̸= pdₐtₐ(·|x), there exists an appropriately chosen λ, such that θt is not the global minimum of (4.7).
Remark 5.3. Theorem 5.2 suggests that under certain conditions, the optimization process of our method naturally stops at the point pθ(·|x) = pdₐtₐ(·|x), implying the effectiveness of our approach in aligning the LLM’s distribution with the target data distribution. Moreover, Theorem 5.2 also indicates that the optimization process only stops when the global optimality is achieved, i.e., the LLM’s distribution aligns with the target data distribution.

8

For the logistic loss function ℓ(t) = log(1 + exp(−t)), the following theorem gives a more precise characterization of the opponent player, enabling a better understanding of SPIN.
Theorem 5.4. Consider the choice of logistic loss ℓ(t) = log(1 + exp(−t)) in SPIN. Suppose that
pθ (y|x) pdₐtₐ(y|x)/pθ (y|x) 1/λ lies in the LLM space {pθ(y|x)|θ ∈ Θ} and θt₊₁ is global minimum
of LSPIN(θ, θt), then the opponent player at iteration t + 1 satisfies
pθ  (y|x) ∝ pθ (y|x) pdₐtₐ(y|x)/pθ (y|x) 1/λ.
Remark 5.5. According to Theorem 5.4, the model update from pθt (y|x) to pθt+1 (y|x) tends to increase the probability pθt+1 (y|x) when pθt (y|x) is less than pdₐtₐ(y|x), and decrease it when pθt (y|x) is greater than pdₐtₐ(y|x). Thus, Theorem 5.4 further confirms that our method’s optimization process naturally converges to the point where pθ(·|x) equals pdₐtₐ(·|x). The update of the opponent player is controlled by pdₐtₐ(y|x)/pθ (y|x) 1/λ, which is regulated by the factor 1/λ. A smaller λ results in a larger change of the opponent player, while a larger λ leads to a smaller change. Therefore, as pθ(·|x) approaches pdₐtₐ(·|x), increasing λ enhances the stability of LLM training. This observation aligns with (4.3), where λ is the regularization parameter of the KL regularization that is employed to control the deviation of the opponent player.
6  Experiments
This section provides a detailed empirical analysis of SPIN. Our findings highlight several key points:
(1) SPIN markedly enhances model performance across a wide range of evaluation benchmarks by breaking the limit of SFT; (2) even without introducing new human annotated data, SPIN at iteration 0 achieves performance on par to DPO training that utilizes even more data; (3) iterative training is a necessary component in SPIN as it breaks the limit of multi-epoch training.
6.1  Experiment Setup
Model and Datasets. In this study, we adopt zephyr-7b-sft-full as our base model. This model derives from the pre-trained Mistral-7B (Jiang et al., 2023) and has been further fine-tuned on the SFT dataset Ultrachat200k1 by HuggingFace. Ultrachat200k represents a high-quality 200k subset of the larger UltraChat (Ding et al., 2023) corpus, which comprises approximately 1.4M dialogues produced using OpenAI’s Turbo APIs. From UltraChat200k, We randomly sample 50k prompts and use the base model to generate the synthetic responses. We subsequently follow the optimization method described in Section 4.1 for further training. In multiple iterations, we leverage the synthetic data from the most recent iteration and add to the newly generated synthetic data, therefore resulting in a synthetic dataset size of 50k at iteration 0 and 100k at iteration 1, 2 and 3. At each iteration, we train our model for 2 epochs.
Evaluation. We employed the widely used Huggingface Open LLM Leaderboard (Beeching et al., 2023) as our evaluation benchmark, using the same Language Model Evaluation Harness library (Gao et al., 2023b). This leaderboard encompasses 6 different datasets, each focusing on a a specific capability of LLMs. Collectively, these datasets provide a thorough assessment framework, evaluating LLMs on commonsense reasoning (Arc (Clark et al., 2018), HellaSwag (Zellers et al., 2019), Winogrande (Sakaguchi et al., 2021)), multi-task language understanding (MMLU(Hendrycks et al., 2020)), human falsehood mimic (TruthfulQA (Lin et al., 2021)) and math problem solving
¹https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k

9

(GSM8k (Cobbe et al., 2021)). In evaluation, the language models are prompted with few-shot in-context examples and the question. We follow the standard approach and report the average score across all datasets. In Table 1, we detail the evaluation setting adopted by both the leaderboard and our experiments. We leave further implementation details to Appendix B.
Table 1: Detailed information of HuggingFace Open LLM Leaderboard. For each evaluation dataset, we present the number of few-shot examples and metric adopted for evaluation.

Datasets    Arc   TruthfulQA  Winogrande  GSM8k  HellaSwag  MMLU

# few-shot Metric
25       0        5       5      10      5
acc_norm    mc2      acc     acc   acc_norm   acc

6.2  SPIN Effectively Improves Benchmark Performance

HuggingFace Open LLM Benchmark


63
62.97
63.16

62          62.12


61
60.80
60


59


58 58.14


SFT  SPIN
iter-0
SPIN
iter-1
SPIN
iter-2
SPIN
iter-3
Figure 2: The average score of SPIN at different iterations on the HuggingFace Open LLM leaderboard datasets. For “SFT”, we report the performance of our base model zephyr-7b-sft-full, which has been fine-tuned on the same dataset we use to generate synthetic data.
We demonstrate the effectiveness of SPIN using HuggingFace Open LLM Leaderboard as a wide range of evaluation. In Table 2, we compare the performance of our fine-tuned model by SPIN after iterations 0 to 3 with the base model zephyr-7b-sft-full. We can observe that SPIN exhibits remarkable effectiveness in improving the model’s performance by further leveraging the SFT dataset, on which the base model has already been fully fine-tuned. At iteration 0, where model responses are generated from zephyr-7b-sft-full, we observe an overall improvement of 2.66% on the average score. The improvement is particularly significant on the TruthfulQA and GSM8k benchmarks, with improvement exceeding 5% and 10% respectively. At iteration 1, we employ the LLM model from iteration 0 to generate new responses for SPIN, adhering to the procedure outlined in Algorithm 1. This iteration yields further enhancements of 1.32% on average, and especially significant on the Arc Challenge and TruthfulQA benchmarks. Subsequent iterations continue this trend of incremental improvement across various tasks. Meanwhile, the improvement at iteration t + 1 is naturally smaller than that at iteration t. As the iterative training progresses, the degree of improvement gradually

10

approaches zero, suggesting that the model has reached a limiting point in the last iteration.
Table 2: Test performance of SPIN based on zephyr-7b-sft-full across HuggingFace Open LLM Leaderboard datasets. We also denote the average improvement over last iteration in the Average column.

Model     Arc  TruthfulQA  Winogrande  GSM8k  HellaSwag  MMLU  Average

zephyr-7b-sft-full SPIN iteration 0
SPIN iteration 1
SPIN iteration 2
SPIN iteration 3
60.41    43.73     74.19    26.76    82.85    60.92    58.14
63.40   49.18     72.69    35.10    84.38    60.03  60.80(+2.66)
65.19   55.17     72.30    35.78    84.96    59.34  62.12(+1.32)
65.96   54.91     73.56    38.06    85.41    59.93  62.97(+0.85)
65.87   54.90     73.72    38.97    85.54    59.99  63.16(+0.19)

Comparison with DPO. zephyr-7b-beta is a model derived from zephyr-7b-sft-full, trained with DPO on approximately 62k preference data. This data, the UltraFeedback Binarized dataset(Cui et al., 2023)2, comprises both chosen and rejected completions evaluated by GPT-4. We note that, DPO requires either human input or advanced language model feedback to determine the preference, making data generation a rather expensive procedure. In contrast, our SPIN only requires the initial model itself. Moreover, unlike DPO which requires new data source, our method exclusively leverages the existing SFT dataset. In Figure 3, we show the performance comparison of SPIN at iterations 0 and 1 (employing 50k SFT data) with DPO training, from the same SFT checkpoint. We can observe that, while DPO leverages more data from new sources, SPIN based on the existing SFT data can already achieve comparable average performance to DPO training at iteration 0. From iteration 1, SPIN even surpasses the performance of DPO on the leaderboard benchmark.

Zephyr-SFT
80
Zephyr-DPO
70                                                SPIN-iter-0
60                                                SPIN-iter-1
SPIN-iter-2
50                                                SPIN-iter-3
40
30
20
10
0
Arc  TruthfulQA Winogrande  GSM8k  Hellaswag  MMLU  Average
Figure 3: Performance comparison with DPO training across the six benchmark datasets. Self-play at iteration 0 achieves comparable performance to DPO training with 62k new data. At iteration 1, self-play has already surpassed DPO training on the majority of datasets.

6.3  Ablation Studies
In this subsection, we examine the effect of synthetic dataset size and training epochs within an iteration. Our analysis demonstrates the effectiveness of the synthetic data used by SPIN compared to the SFT data, as well as the necessity of iterative training in SPIN. Furthermore, to comprehensively
²https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized

11

assess the performance improvements of SPIN, we perform additional evaluations on benchmark tasks distinct from those in the Open LLM leaderboard.




61.0



60.83
Performance Comparison


SFT SPIN
60.5
60.16

60.0

59.82


59.5


59.0
59.55


59.04


59.27


58.5
58.14
58.0


Training Size

Figure 4: The scaling effect of training size of SPIN compared to SFT on the average score of Open LLM Leaderboard. For SPIN, we consider training data of sizes 14k, 26k and 50k where the larger dataset contains the smaller dataset. The starting point for SPIN (with x-axis 0) is the zephyr-7b-sft-full checkpoint, which has been fine-tuned on Ultrachat200k for 1 epoch. We report the model performance trained for 1 epoch with SPIN on the varying sizes of dataset. We additionally compare with SFT, where we fine-tune Mistral-7B on Ultrachat200k for 3 consecutive epochs and report the model performance at the first epoch as the starting point (with x-axis 0).

Training Size. We investigate the effect of varying training data size on the performance of SPIN. In Figure 4, we demonstrate the effect of training size for SPIN during iteration 0 and additionally compare with SFT with the full original dataset. Specifically, for the SFT baseline, we fully fine-tune Mistral-7B on Ultrachat200k for three epochs and report first epoch performance as the starting point (with x-axis 0) in the figure for SFT. For SPIN, we report the zephyr-7b-sft-full checkpoint as the starting point, which has also been fine-tuned on Ultrachat200k for one epoch. We select the training size of SPIN at iteration 0 to be 14k, 26k, and 50k and generate the data accordingly, ensuring that the larger dataset encompasses the smaller dataset. The performance of SPIN was then evaluated after 1 epoch of self-play fine-tuning for each training size. We can observe that, while SPIN results in notable improvement with increasing training sizes, SFT on further epochs 2 and 3 fails to yield more than 1% improvement. Lastly, in Table 3, we also show the performance of SFT from zephyr-7b-sft-full on Ultrachat200k for one epoch. While self-play fine-tuning with synthetic data from zephyr-7b-sft-full effectively improves its performance, simply fine-tuning it again on the SFT data leads to degraded performance, as similarly observed in Figure 4.
Iterative Training v.s. Training for More Epochs. We further study the training within iteration 0 and compare with the performance achieved in iteration 1, particularly contrasting the test performance obtained from extended training duration with that from next iteration. Figure 5 depicts the performance trajectory of the model trained using SPIN over multiple epochs at iteration
0. It is evident that the most substantial improvement occurs during the first two epochs, followed by only modest gains in subsequent epochs. Notably, SPIN exhibits robustness and stability; extending

12

Table 3: Test performance of zephyr-7b-sft-full fine-tuned on Ultrachat200k for 1 more epoch across HuggingFace Open LLM benchmark datasets. SFT fails to further leverage the fine-tuning data for performance enhancement and even results in degraded performance.

Model      Arc  TruthfulQA  Winogrande  GSM8k  HellaSwag  MMLU  Average
zephyr-7b-sft-full  60.41   43.73     74.19    26.76    82.85    60.92   58.14
SFT epoch 1    57.76    44.39      75.77    25.85    81.69    57.89   57.23
the training duration does not diminish performance but rather maintains a rather consistent level. Nevertheless, the observation suggests an inherent limitation to the performance achievable within a single iteration, thereby underscoring the necessity for iterative training. As shown by the test performance achieved at iteration 1 in the figures, extending the training in iteration 0 fails to reach the performance comparable to iteration 1.


65                                     62
54
64                  52                  61


63

62

61        iter 0
iter 1 (epoch 2)
0   1   2   3   4   5
Epoch
50

48

46        iter 0
44        iter 1 (epoch 2)
0   1   2   3   4   5
Epoch

60

59
iter 0
iter 1 (epoch 2)
58
0   1   2   3   4   5
Epoch

(a) Arc Challenge accuracy.
(b) TruthfulQA score.
(c) Average score.

Figure 5: The SPIN training dynamics of zephyr-7b-sft-full on the 50k synthetic data with regard to the number of training epochs during iteration 0. We can observe that iterative training is pivotal as training for more epochs during iteration 0 reaches a limit and cannot surpass iteration 1.

Further Investigation on More Tasks. Here, we further investigate the performance of SPIN on a broader variety of tasks, including MT-Bench (Zheng et al., 2023), Big-Bench (bench authors, 2023) and OpenBookQA (Mihaylov et al., 2018) in addition to the Open LLM Leaderboard tasks. Specifically, we use the following tasks from Big-Bench-Hard for a more comprehensive evaluation, including Causal Judgment (causal reasoning), Sports Understanding (commonsense reasoning) and Formal Fallacies (logical reasoning). In Table 4, we show the resulting scores of SPIN on MT-Bench as well as those tasks from Big-Bench. In Figure 6, we detail the model performances on MT-Bench with regard to different types of questions. We can see a notably robust improvement in the performance of SPIN on various tasks besides the HuggingFace Benchmark, without major degradation. Notably, on MT-Bench, the model fine-tuned by SPIN has surpassed the performance of vicuna-13b-v1.5 (Chiang et al., 2023) with a score of 6.57.
7  Conclusion and Discussion
This paper introduces a novel fine-tuning method SPIN, to convert a weak LLM to a strong LLM by unleashing the full power of human-annotated data. Central to this method is a self-play mechanism,

13

Table 4: Test performance on other reasoning benchmark datasets for SPIN at different iterations and zephyr-7b-sft-full. We report the average score for MT-Bench and the accuracy score for Big Bench datasets under standard few-shot CoT evaluation. On OpenBookQA, we report acc_norm with 1-shot example as used in Anil et al. (2023). As similar to Open LLM Leaderboard evaluation, we observe a steady improvement in performance on the other benchmark tasks, with no significant degradation.

Model      MT-Bench  BB-causal  BB-formal  BB-sports  OpenBookQA

zephyr-7b-sft-full SPIN iteration 0
SPIN iteration 1
SPIN iteration 2
5.94
6.46(+0.52)
6.65(+0.19)
6.78(+0.13)
56.15     49.6     96.0
57.75     51.6     95.2
58.82     51.2     95.2
59.36     51.2     94.4
45.4
46.8
47.2
47.6





Humanities
Writing



Roleplay

model
SPIN iter-2 SPIN iter-1 SPIN iter-0 SFT

STEM

0 1 2 3 4 5 6 7 8 9
Reasoning




Extraction             Math

Coding
Figure 6: Model performance on MT-Bench. We compare SPIN across different iterations with the base SFT model. Starting from iteration 1, our fine-tuned model by SPIN robustly outperforms the SFT checkpoint on all evaluation aspects.

wherein a main player (the LLM) is fine-tuned to differentiate the responses of opponent player (the LLM from previous iteration) from the target data distribution, and the LLM is iteratively aligned with the target data distribution. Therefore, SPIN facilitates the LLM’s iterative self-evaluation and enhancement through self-play. In comparison to supervised fine-tuning and RL fine-tuning methods, SPIN enables the LLM to self-improve without additional human data or feedback from stronger LLMs. Empirical results demonstrate that SPIN significantly enhances LLM performance across diverse benchmarks, even outperforming models trained with additional human data or AI feedback.
Limitation and Future Work. Our theoretical results demonstrate that the optimization process of SPIN converges if and only if the LLM’s distribution aligns with pdₐtₐ. Therefore, our study focuses on a fixed target data distribution generated by humans, which inherently imposes a ceiling on the performance of fine-tuned LLM. Exploring the dynamically changing target data distribution is an important direction to overcome this limitation and elevate the LLM’s performance beyond this ceiling or even to a super-human level. Moreover, considering the resource demands of synthetic data generation, another promising avenue for further exploration is to reduce the volume of required

14

synthetic data.
A  Further Related Work
Curriculum Learning. In deep learning, it has been observed that training models using data samples arranged in a strategically meaningful order can lead to improved performance compared to training on randomly shuffled data. This approach is commonly known as curriculum learning (Bengio et al., 2009; Soviany et al., 2022). Initial studies in curriculum learning introduced efficient algorithms that adhere to an ‘easy-to-hard’ progression (Spitkovsky et al., 2009; Kumar et al., 2010; Lee and Grauman, 2011; Zhang et al., 2015). In the field of Natural Language Processing (NLP), criteria such as sentence length and term frequency are commonly utilized (Cirik et al., 2016; Zhang et al., 2018; Liu et al., 2018). More recent developments include the application of curriculum learning algorithms in multi-modal learning (Liu et al., 2021; Wu et al., 2022). Our work shares a similar idea to curriculum learning, wherein the training data evolves iteratively—beginning with responses that are easy to distinguish from human-annotated data and gradually progressing to more challenging instances.
Generative Adversarial Learning. Generative Adversarial Networks (GANs) (Goodfellow et al., 2014) represent a distinct class of generative models, characterized by their unique adversarial process. To enhance training stability and data quality, Mao et al. (2017) introduced the Least Squares GAN, employing a least squares loss function for the discriminator. A significant advancement in GANs involves the use of Integral Probability Metrics (IPM) (Müller, 1997), particularly highlighted in the development of Wasserstein GAN by Arjovsky et al. (2017). This model employs IPM in its loss design, enhancing training stability. Since then, IPMs have become popular in the design of GANs (Mroueh and Sercu, 2017; Gulrajani et al., 2017), particularly in constraining the discriminator to a specific function class, thereby preventing it from overpowering the generator. Furthermore, Jolicoeur-Martineau (2018) generalized IPM-based GANs by introducing relativistic discriminator and proposed Relativistic GAN. It is worth noting that the objective function defined in our (4.2) is similar to Relativistic GAN (Jolicoeur-Martineau, 2018) and reduces to an IPM framework in Wasserstein GAN (Arjovsky et al., 2017) with a linear loss. However, our approach differs in both the choice of the function class and the training procedure. Inspired by GAN, Cheng et al. (2023) proposed an adversarial learning framework named Adversarial Preference Optimization (APO) that trains the LLM and a reward model in an adversarial game. Our method is also related to Generative Adversarial Imitation Learning (GAIL) (Ho and Ermon, 2016), which trains separate discriminator and policy networks in each iteration for imitation learning. In contrast to the above methods, SPIN relies on self-play where both the main player and the opponent player are the same LLM from two consecutive iterations.
B  Experiment Details
B.1  Hyperparameters and Implementation Details
We use the Alignment Handbook library (Tunstall et al., 2023b) as the codebase for our self- play fine-tuning method SPIN, which includes DeepSpeed ZeRO-3 (Rajbhandari et al., 2020) and FlashAttention-2 (Dao, 2023) to reduce training cost. We train our models with RMSProp (Hinton et al., 2012) optimizer with no weight decay for all iterations as commonly used in fine-tuning LLMs for alignment, with a global batch size of 64, 10% warmup steps and bfloat16 precision. We set the peak learning rate to be 5e-7 for iterations 0 and 1, and decay this peak learning rate to 1e-7 for


15

iteration 2 and 3 as we are approaching the end of self-play fine-tuning. Lastly, we choose β = 0.1 and max sequence length to be 2048 tokens as in Tunstall et al. (2023b). We note that at the last iteration (iter-3) where the model is close to convergence, we increase the value of β to 5.0. We use the Accelerate library (Gugger et al., 2022) to generate our synthetic data using distributed inference with multiple GPUs with a global batch size of 64. We consider the prompting template “### Instruction: {prompt}\n\n### Response: ” as commonly used in Taori et al. (2023). For Ultrachat200k containing multi-round conversations, we only sample the first round as our prompt and ground truth completion pairs.
B.2  Generation Examples
In Tables 5 and 6, we further provide the generation examples of our fine-tuned model by SPIN from different iterations. We can observe an improvement in response quality as compared to the generation of the SFT checkpoint. Meanwhile, the model generations at higher iterations typically becomes more concise than iteration 0 and resemble the ground truth completion better.
C  Proof of Theorems in Section 5
C.1  Proof of Theorem 5.2
Proof of Theorem 5.2. To begin with, we prove the “Sufficiency” in Theorem 5.2. Since pdₐtₐ(·|x) =
pθ (·|x), by symmetry property of y and y′, we have for any θ ∈ Θ that

pθ(y|x)
pθ(y′|x) 

2LSPIN(θ, θt) = Ex∼q(·),y∼pdₐtₐ(·|x),y′∼pθ (·|x) ℓ
γ log
pθt
   
− γ log
(y|x)    pθt
pθ(y|x)
(y′|x)
pθ(y′|x) 

+ Ex∼q(·),y′∼pdₐtₐ(·|x),y∼pθ (·|x) ℓ
γ log
pθt
− γ log
(y|x)    pθt
(y′|x)

pθ(y|x)
pθ(y′|x) 

= Ex∼q(·),y∼pdₐtₐ(·|x),y′∼pθ (·|x) ℓ
γ log
pθt
− γ log
(y|x)    pθt
(y′|x)

pθ(y′|x)
pθ(y|x) 

+ ℓ γ log
pθt
(y′|x) − γ log p (y|x)

  γ
pθ(y|x)  γ
pθ(y′|x)

≥ 2Ex∼q(·),y∼pdₐtₐ(·|x),y′∼pθ (·|x) ℓ
log
2  pθt
− log
(y|x)  2  pθt
(y′|x)

γ  pθ(y′|x)  γ
pθ(y|x) 

+  log
2  pθt
= 2ℓ(0),
(y′|x) − 2 log p
(y|x)
where the inequality is due to Jensen’s inequality (recalling that ℓ is convex in Assumption 5.1). Therefore, we have that LSPIN(θ, θt) ≥ ℓ(0) = LSPIN(θt, θt), which means that θt is the global optimum of (4.7). As a consequence, the gradient at the point θt is zero, which concludes θt₊₁ = θt.
Next, we prove the “Necessity”. Define g(λ) as follows:

pdₐtₐ(y|x)
pdₐtₐ(y′|x) 

g(λ) = Ex∼q(·),y∼pdₐtₐ(·|x),y′∼pθ (·|x) ℓ

Then we have g(0) = ℓ(0) and
λ log
pθt
− λ log
(y|x)
pθt
(y′|x)  .


′                  ′
pdₐtₐ(y|x)
pdₐtₐ(y′|x) 

g (0) = Ex∼q(·),y∼pdₐtₐ(·|x),y′∼pθ (·|x)
ℓ (0)
log

16
pθt
− log
(y|x)
pθt
(y′|x)

Table 5: Generation example of our fine-tuned model by SPIN at different iterations.

Prompt       How does the economic growth of Horsham compare to nearby towns?

Ground truth



zephyr-7b=sft-full






Iteration 0









Iteration 1







Iteration 2
I do not have access to the latest economic data on horsham and nearby towns. However, you can check the latest economic statistics and reports provided by the local government or the official websites of horsham and nearby towns for a detailed comparison of their economic growth.
According to the given material, Horsham was growing "significantly" faster than nearby towns, indicating that it was economically thriving.\n However, the given material does not specify the exact rates or levels of economic growth of Horsham compared to nearby towns. Without this information, it is challenging to determine whether the differences in economic growth between Horsham and nearby towns were significant or minimal.
I do not have access to the latest economic data for horsham and nearby towns. However, horsham is known to be a prosperous town in west sussex, uk, with a diverse economy that includes agriculture, manufacturing, and services. The town has a strong retail sector, and it is also home to several large companies, including the global pharmaceutical company novartis. In terms of comparison with nearby towns, horsham is generally considered to be one of the more affluent towns in the region. However, the economic growth of horsham and its neighboring towns may vary depending on various factors such as industry, investment, and government policies.
I do not have access to real-time data or information about the most recent economic growth of horsesham and nearby towns. However, according to the recent reports from various sources such as the office for national statistics, horsesham’s economy primarily relies on retail, healthcare, education, and public administration industries. Compared to nearby towns such as lewes, chichester, and bognor regis, horsesham’s economy may have a different composition and growth rate based on their specific industries and economic policies.
I don’t have access to the most recent economic data. However, according to a 2019 report by pwc, horsham’s expected economic growth up to 2025 was projected to be around 2.3% per annum, which is slightly below the average for the south east of england (2.8%). Neighbouring towns like crawley and bognor regis were projected to experience similar growth rates. note: this may not reflect the impact of the covid-19 pandemic that occurred in 2020.

′             pdₐtₐ(y|x)             pdₐtₐ(y′|x) 

= ℓ (0)
Ex∼q(·),y∼pdₐtₐ(·|x)
log
pθt
(y|x)
− Ex∼q(·),y′∼pθ (·|x)
log
pθt
(y′|x)


17

Table 6: Another generation example of our fine-tuned model by SPIN at different iterations.


Prompt



Ground truth



zephyr-7b=sft-full

Iteration 0





Iteration 1





Iteration 2
Can you clarify if Poppelsdorfer Allee 45 and the old site of the Mathe- matical Institute are the same location? Answer according to: Go straight to Poppelsdorfer Allee 45 and sign-in.\n There is a big lecture hall at the old site of the Mathematical Institute (Wegelerstr. 10, Bonn).
No, Poppelsdorfer Allee 45 and the old site of the Mathematical Institute (Wegelerstr. 10, Bonn) are not the same location. To sign-in, one should go straight to Poppelsdorfer Allee 45. However, there is a big lecture hall at the old site of the Mathematical Institute.
Yes, Poppelsdorfer Allee 45 and the old site of the Mathematical Institute are the same location.
Yes, Poppelsdorfer Allee 45 and the old site of the Mathematical Institute (Wegelerstr. 10, Bonn) are the same location. The Mathematical Institute has been relocated and renamed as the Institute for Mathematics and Theoretical Physics, but the building where it used to be is still referred to as the old site. The big lecture hall at the old site still exists and may be used for events or classes.
No, Poppelsdorfer Allee 45 and the old site of the Mathematical Institute are not the same location. While Poppelsdorfer Allee 45 is where attendees should sign-in, the old site of the Mathematical Institute (located at Wegelerstr. 10, Bonn) has a large lecture hall mentioned in the statement. Therefore, it can be assumed that the two locations are separate and not the same.
Poppelsdorfer Allee 45 and the old site of the Mathematical Institute (Wegelerstr. 10, Bonn) are two different locations. As per the instruction, you need to go straight to Poppelsdorfer Allee 45 and sign-in. However, there is a lecture hall mentioned at the old site of the Mathematical Institute (Wegelerstr. 10, Bonn).




t          t
< 0,
where the last inequality is due to the condition that ℓ′(0) < 0. Therefore, there exist a λ₀ such that for all 0 < λ < λ₀, we have g(λ) < ℓ(0). Choose θ∗ such that pθ∗ (y|x) = pdₐtₐ(y|x). For those 0 < λ < λ₀, we have that

∗                         pθ∗ (y|x)
pθ∗ (y′|x) 

LSPIN(θ
, θt) = Ex∼q(·),y∼pθ∗ (·|x),y′∼pθt (·|x) ℓ
λ log
pθt
− λ log
(y|x)    pθt
(y′|x)

pdₐtₐ(y|x)
pdₐtₐ(y′|x) 

= Ex∼q(·),y∼pdₐtₐ(·|x),y′∼pθ (·|x) ℓ
= g(λ)

18
λ log
pθt
− λ log
(y|x)
pθt
(y′|x)

< g(0)
= LSPIN(θt, θt),
where the second equality holds by the choice of pθ∗ (·|x), and the inequality holds due to the choice of λ. Therefore, we conclude that θt is not the global optimum of (4.7) if pθt (·|x) ̸= pdₐtₐ(·|x).
C.2  Proof Theorem 5.4
We need the following auxiliary lemma before we prove Theorem 5.4.
Lemma C.1. Suppose that ℓ(t) = log(1 + exp(−t)) and for a, b > 0, the following inequality holds
aℓ(t) + bℓ(−t) ≥ a log(1 + b/a) + b log(1 + a/b),
the equality holds if and only if t = log(a/b).
Proof of Lemma C.1. Define g(t) = aℓ(t) + bℓ(−t) = a log(1 + exp(−t)) + b log(1 + exp(t)), then we have

g′(t) = − a exp(−t)
1 + exp(−t)
b exp(t)
+
1 + exp(t)
−a + b exp(t)
=        .
1 + exp(t)
Therefore, g′(t) < 0 when t < log(a/b), g′(t) > 0 when t > log(a/b), which indicates that g achieves it minimum at t = log(a/b) which concludes the proof.
Lemma C.1 shows that the global minimum of aℓ(t) + bℓ(−t) is achieved when t = log(a/b). Based on Lemma C.1, we can further prove that (4.2) with the logistic loss function has a closed-form solution if we ignore the constraint set Ft.
Lemma C.2. Denote p₊(y, y′, x) = q(x) · pdₐtₐ(y|x) · pθ (y′|x) and p−(y, y′, x) = q(x) · pθ (y′|x) ·

pdₐtₐ(y|x),


Ex∼q(·),y∼p





data



(·|x),y′∼pθt
t                       t



₍·|ₓ₎ ℓ f (x, y) − f (x, y′)  ≥ log 2 − JSD(p₊ p−),
where JSD(p₊ p−) represents the Jensen–Shannon divergence which is defined as follows


JSD ¨q
1
= KL 2
p¨ p + q + 1 KL
q¨ p + q ,
where KL(· ·) is KL-divergence. JSD is always non-negative and equals zero if and only if p₊ and p− are identical. Moreover, the global minimum value log 2 − JSD(p₊ p−) is achieved by f ∗ if and only if,
f ∗(x, y) = Z(x) + log  pdata(y|x) ,
pθt (y|x)
where Z(x) is any function that is possibly dependent on x.
Proof of Lemma C.2. We rewrite the objective function in the following formula,
2Ex∼q(·),y∼pdₐtₐ(·|x),y′∼pθt (·|x) ℓ f (x, y) − f (x, y′) 


19

= ∫ q(x)pdₐtₐ(y|x)pθ (y′|x) ℓ f (x, y) − f (x, y′) dydy′
+ ∫ q(x)pdₐtₐ(y′|x)pθ (y|x) ℓ f (x, y′) − f (x, y) dydy′
= ∫ q(x)pdₐtₐ(y|x)pθ (y′|x)ℓ f (x, y) − f (x, y′) 
+ q(x)pdₐtₐ(y′|x)pθ (y|x)ℓ f (x, y′) − f (x, y) dydy′

(i)
≥
q(x)pdₐtₐ(y|x)pθ (y′|x) log
′
1 +       t
pdₐtₐ(y|x)pθt (y′|x)

+ q(x)pdₐtₐ(y′|x)pθ (y|x) log
′
1 +       t
pdₐtₐ(y′|x)pθt (y|x)
dydy′,
where the inequality is due to aℓ(t) + bℓ(−t) ≥ a log(1 + b/a) + b log(1 + a/b) in Lemma C.1 with
a = q(x)pdₐtₐ(y|x)pθ (y′|x), b = q(x)pdₐtₐ(y′|x)pθ (y|x), t = f (x, y) − f (x, y′). The equality (i)
t                    t
holds if and only if the following equation holds almost surely for any x, y, y′,


f (x, y) − f (x, y′) = log

Equation (C.1) is equivalent to
t
pdₐtₐ(y′|x)pθt (y|x)
. (C.1)
 pdₐtₐ(y|x)     ′    pdₐtₐ(y′|x) 

f (x, y) − log
pθt
(y|x)
= f (x, y ) − log
pθt
(y′|x)
holds almost surely for any x, y, y′. Therefore, the equality (i) holds if and only if there exists some
Z(x) such that
f (x, y) = Z(x) + log  pdata(y|x) .
pθt (y|x)
Recall that p₊(y, y′|x) = pdₐtₐ(y|x) · pθ (y|x) and p−(y, y′|x) = pθ (y|x) · pdₐtₐ(y|x). Then, the
t                   t
right-hand side of (i) can be written as

∫ q(x)pdₐtₐ(y|x)pθ (y′|x) log
′
1 +       t
pdₐtₐ(y|x)pθt (y′|x)

+ q(x)pdₐtₐ(y′|x)pθ (y|x) log
′
1 +       t
pdₐtₐ(y′|x)pθt (y|x)
dydy′
∫     ′        p−(y, y′|x)       ′        p₊(y, y′|x)    ′

=  p₊(y, y |x) log
1 + p (y, y′|x)
+ p−(y, y |x) log
1 + p (y, y′|x)
dydy
∫    ′    1/2[p−(y, y′|x) + p₊(y, y′|x)] 

= 2 log 2 +
p₊(y, y |x) log
p₊(y, y′|x)
′    1/2[p−(y, y′|x) + p₊(y, y′|x)]   ′

+ p−(y, y |x) log
p−(y, y′|x)
dydy

= 2 log 2 − KL p
¨ p+ + p− − KL p
¨ p₊ + p− 
+¨  2        −¨  2
= 2 log 2 − 2 · JSD(p₊ p−),
where the last equality is by the definition of JSD. This concludes the proof.

20

Lemma C.2 provides a closed-form solution to (4.2) if we ignore the constraint set Ft. If this closed-form solution belongs to Ft, then it should also be the solution to (4.2). This observation is the key to the proof of Theorem 5.4.
Proof of Theorem 5.4. Under the condition of Theorem 5.4, there exists a pθ such that
pθ(y|x) ∝ pθ (y|x) pdₐtₐ(y|x)/pθ (y|x) 1/λ.
t             t

Therefore, there exists a function Z^(x) such that


t             t

Applying logarithm function on both side of (C.2) yields
λ log(Z^(x)) + log pdata(y|x) = λ log  pθ (y|x)  ∈ F .

By Lemma C.2, f ∗(x, y) = λ log(Z^(x)) + log pdata(y|x) is the global minimum of the following

minimization problem,

argmin Ey∼p
f




data



(·|x),y′∼pθt


₍·|ₓ₎ ℓ f (x, y) − f (x, y′) . (C.3)
Since f ∗ ∈ Ft, f ∗(x, y) = λ log(Z^(x)) +log pdata(y|x) is also the global optimum of the optimization

problem (4.2),

argmin Ey∼p
f ∈Ft





data



(·|x),y′∼pθt


₍·|ₓ₎ ℓ f (x, y) − f (x, y′) .

Therefore, we have proved that
min Ey∼p
f






data




(·|x),y′∼pθt


₍·|ₓ₎ ℓ f (x, y) − f (x, y′) 

= min Ey∼p
f ∈Ft


data

(·|x),y′∼pθt
₍·|ₓ₎ ℓ f (x, y) − f (x, y′) 
= min LSPIN(θ, θt). (C.4)
θ∈Θ
Since θ  is the global minimum of L  (θ, θ ). Then by (C.4), λ log pθt+1 (y|x)  should be the
global minimum of problem (C.3). By Lemma C.2, there exists Z(x) such that
λ log pθt+1 (y|x) = Z(x) + log pdata(y|x) ,
pθt (y|x)           pθt (y|x)
which leads to the result that pθ  (y|x) ∝ pθ (y|x) pdₐtₐ(y|x)/pθ (y|x) 1/λ.





21

References

Anɪʟ,
R., Daɪ,
A. M., Fɪʀᴀᴛ,
O., Joʜnson,
M., Lᴇᴘɪᴋʜɪn,
D., Passos, A., Sʜᴀᴋᴇʀɪ,
S.,
Taʀᴏᴘᴀ, E., Baɪʟᴇy, P., Cʜᴇn, Z. ᴇᴛ ᴀʟ. (2023). Palm 2 technical report. arXiv preprint arXiv:2305.10403 .
Anᴛʜᴏny, T., Tɪᴀn, Z. and Baʀbᴇʀ, D. (2017). Thinking fast and slow with deep learning and tree search. Advances in neural information processing systems 30.
Aʀjovsᴋy, M., Cʜɪnᴛᴀʟᴀ, S. and Boᴛᴛᴏu, L. (2017). Wasserstein generative adversarial networks.
In International conference on machine learning. PMLR.
Ausᴛɪn, J., Odᴇna, A., Nyᴇ, M., Bosma, M., Mɪᴄʜᴀʟᴇᴡꜱᴋɪ, H., Doʜᴀn, D., Jɪᴀng, E., Caɪ, C., Tᴇʀʀy, M., Lᴇ, Q. ᴇᴛ ᴀʟ. (2021). Program synthesis with large language models. arXiv preprint arXiv:2108.07732 .
Baɪ, Y., Jᴏnᴇꜱ, A., Ndᴏuꜱꜱᴇ, K., Aꜱᴋᴇʟʟ, A., Cʜᴇn, A., DaꜱSaʀᴍᴀ, N., Dʀᴀɪn, D., Fᴏʀᴛ, S., Ganguʟɪ, D., Hᴇnɪgʜᴀn, T. ᴇᴛ ᴀʟ. (2022a). Training a helpful and harmless assistant with reinforcement learning from human feedback. arXiv preprint arXiv:2204.05862 .
Baɪ, Y., Kadavaᴛʜ, S., Kundu, S., Aꜱᴋᴇʟʟ, A., Kᴇʀnɪᴏn, J., Jᴏnᴇꜱ, A., Cʜᴇn, A., Gᴏʟᴅɪᴇ, A., Mɪʀʜᴏꜱᴇɪnɪ, A., McKɪnnᴏn, C. ᴇᴛ ᴀʟ. (2022b). Constitutional ai: Harmlessness from ai feedback. arXiv preprint arXiv:2212.08073 .
Banꜱᴀʟ, T., Pacʜᴏᴄᴋɪ, J., Sɪᴅᴏʀ, S., Suᴛꜱᴋᴇvᴇʀ, I. and Mᴏʀᴅᴀᴛᴄʜ, I. (2018). Emergent complexity via multi-agent competition. In International Conference on Learning Representations.
Bᴇᴇᴄʜɪng, E., Fᴏuʀʀɪᴇʀ, C., Habɪb, N., Han, S., Lambᴇʀᴛ, N., Rajanɪ, N., Sanꜱᴇvɪᴇʀᴏ, O., Tunꜱᴛᴀʟʟ, L. and Wᴏʟf, T. (2023). Open llm leaderboard.

bᴇncʜ
ᴀuᴛʜᴏʀꜱ,
B. (2023). Beyond the imitation game: Quantifying and extrapolating the
capabilities of language models. Transactions on Machine Learning Research .
Bᴇngɪᴏ, Y., Lᴏuʀᴀᴅᴏuʀ, J., Cᴏʟʟᴏbᴇʀᴛ, R. and Wᴇꜱᴛᴏn, J. (2009). Curriculum learning. In
Proceedings of the 26th annual international conference on machine learning.
Bʀᴏᴡn, T., Mann, B., Rydᴇʀ, N., Subbɪᴀʜ, M., Kaᴘʟᴀn, J. D., Dʜᴀʀɪᴡᴀʟ, P., Nᴇᴇʟᴀᴋᴀnᴛᴀn, A., Sʜyam, P., Saꜱᴛʀy, G., Aꜱᴋᴇʟʟ, A. ᴇᴛ ᴀʟ. (2020). Language models are few-shot learners. Advances in neural information processing systems 33 1877–1901.
Bubᴇᴄᴋ, S., Cʜᴀndʀᴀꜱᴇᴋᴀʀᴀn, V., Eʟᴅᴀn, R., Gᴇʜʀᴋᴇ, J., Hᴏʀvɪᴛz, E., Kamaʀ, E., Lᴇᴇ, P., Lᴇᴇ, Y. T., Lɪ, Y., Lundbᴇʀg, S. ᴇᴛ ᴀʟ. (2023). Sparks of artificial general intelligence: Early experiments with gpt-4. arXiv preprint arXiv:2303.12712 .
Buʀnꜱ, C., Izmaɪʟᴏv, P., Kɪʀᴄʜnᴇʀ, J. H., Baᴋᴇʀ, B., Gaᴏ, L., Aꜱᴄʜᴇnbʀᴇnnᴇʀ, L., Cʜᴇn, Y., Ecᴏffᴇᴛ, A., Jᴏgʟᴇᴋᴀʀ, M., Lᴇɪᴋᴇ, J. ᴇᴛ ᴀʟ. (2023). Weak-to-strong generalization: Eliciting strong capabilities with weak supervision .
Cʜᴇn, M., Tᴡᴏʀᴇᴋ, J., Jun, H., Yuan, Q., Pɪnᴛᴏ, H. P. d. O., Kaᴘʟᴀn, J., Edᴡᴀʀᴅꜱ, H., Buʀᴅᴀ, Y., Jᴏꜱᴇᴘʜ, N., Bʀᴏᴄᴋᴍᴀn, G. ᴇᴛ ᴀʟ. (2021). Evaluating large language models trained on code. arXiv preprint arXiv:2107.03374 .

22

Cʜᴇng, P., Yang, Y., Lɪ, J., Daɪ, Y. and Du, N. (2023). Adversarial preference optimization.

Cʜɪᴀng,
W.-L., Lɪ,
Z., Lɪn,
Z., Sʜᴇng,
Y., Wu, Z., Zʜᴀng,
H., Zʜᴇng,
L., Zʜuang,
S.,
Zʜuang, Y., Gᴏnzaʟᴇz, J. E., Sᴛᴏɪᴄᴀ, I. and Xɪng, E. P. (2023). Vicuna: An open-source chatbot impressing gpt-4 with 90%* chatgpt quality.
Cʜʀɪꜱᴛɪᴀnᴏ, P. F., Lᴇɪᴋᴇ, J., Bʀᴏᴡn, T., Maʀᴛɪᴄ, M., Lᴇgg, S. and Amᴏᴅᴇɪ, D. (2017). Deep reinforcement learning from human preferences. Advances in neural information processing systems 30.
Cʜung, H. W., Hᴏu, L., Lᴏngᴘʀᴇ, S., Zᴏᴘʜ, B., Tay, Y., Fᴇᴅuꜱ, W., Lɪ, Y., Wang, X., Dᴇʜgʜᴀnɪ, M., Bʀᴀʜᴍᴀ, S. ᴇᴛ ᴀʟ. (2022). Scaling instruction-finetuned language models. arXiv preprint arXiv:2210.11416 .
Cɪʀɪᴋ, V., Hᴏvy, E. and Mᴏʀᴇncy, L.-P. (2016). Visualizing and understanding curriculum learning for long short-term memory networks. arXiv preprint arXiv:1611.06204 .
Cʟᴀʀᴋ, P., Cᴏᴡʜᴇy, I., Eᴛzɪᴏnɪ, O., Kʜᴏᴛ, T., Sabʜᴀʀᴡᴀʟ, A., Scʜᴏᴇnɪᴄᴋ, C. and Tafjᴏʀᴅ,
O. (2018). Think you have solved question answering? try arc, the ai2 reasoning challenge. arXiv preprint arXiv:1803.05457 .
Cᴏbbᴇ, K., Kᴏꜱᴀʀᴀju, V., Bavaʀɪᴀn, M., Cʜᴇn, M., Jun, H., Kaɪꜱᴇʀ, L., Pʟᴀᴘᴘᴇʀᴛ, M., Tᴡᴏʀᴇᴋ, J., Hɪʟᴛᴏn, J., Naᴋᴀnᴏ, R. ᴇᴛ ᴀʟ. (2021). Training verifiers to solve math word problems. arXiv preprint arXiv:2110.14168 .
Cuɪ, G., Yuan, L., Dɪng, N., Yaᴏ, G., Zʜu, W., Nɪ, Y., Xɪᴇ, G., Lɪu, Z. and Sun, M. (2023).
Ultrafeedback: Boosting language models with high-quality feedback.
Daᴏ, T. (2023). Flashattention-2: Faster attention with better parallelism and work partitioning.
arXiv preprint arXiv:2307.08691 .
Dᴇng, Y., Zʜᴀng, W., Cʜᴇn, Z. and Gu, Q. (2023). Rephrase and respond: Let large language models ask better questions for themselves. arXiv preprint arXiv:2311.04205 .
Dɪng, N., Cʜᴇn, Y., Xu, B., Qɪn, Y., Zʜᴇng, Z., Hu, S., Lɪu, Z., Sun, M. and Zʜᴏu, B. (2023). Enhancing chat language models by scaling high-quality instructional conversations. arXiv preprint arXiv:2305.14233 .
Fʀᴇɪ, S., Zᴏu, D., Cʜᴇn, Z. and Gu, Q. (2022). Self-training converts weak learners to strong learners in mixture models. In International Conference on Artificial Intelligence and Statistics. PMLR.
Fʀᴇund, Y. (1995). Boosting a weak learning algorithm by majority. Information and computation
121 256–285.
Fʀᴇund, Y. and Scʜᴀᴘɪʀᴇ, R. E. (1997). A decision-theoretic generalization of on-line learning and an application to boosting. Journal of computer and system sciences 55 119–139.
Gaᴏ, L., Scʜuʟᴍᴀn, J. and Hɪʟᴛᴏn, J. (2023a). Scaling laws for reward model overoptimization.
In International Conference on Machine Learning. PMLR.

23

Gaᴏ, L., Tᴏᴡ, J., Abbaꜱɪ, B., Bɪᴅᴇʀᴍᴀn, S., Bʟᴀᴄᴋ, S., DɪPᴏfɪ, A., Fᴏꜱᴛᴇʀ, C., Gᴏʟᴅɪng,
L., Hꜱu, J., Lᴇ Nᴏᴀᴄ’ʜ, A., Lɪ, H., McDᴏnᴇʟʟ, K., Muᴇnnɪgʜᴏff, N., Ocɪᴇᴘᴀ, C., Pʜᴀng, J., Rᴇynᴏʟᴅꜱ, L., Scʜᴏᴇʟᴋᴏᴘf, H., Sᴋᴏᴡʀᴏn, A., Suᴛᴀᴡɪᴋᴀ, L., Tang, E., Tʜɪᴛᴇ, A., Wang, B., Wang, K. and Zᴏu, A. (2023b). A framework for few-shot language model evaluation.
Gᴏᴏᴅfᴇʟʟᴏᴡ, I., Pᴏugᴇᴛ-Abadɪᴇ, J., Mɪʀza, M., Xu, B., Waʀᴅᴇ-Faʀʟᴇy, D., Ozaɪʀ, S.,

Cᴏuʀvɪʟʟᴇ,
A. and
Bᴇngɪᴏ,
Y. (2014). Generative adversarial nets. Advances in neural
information processing systems 27.

Gʀᴀndvaʟᴇᴛ,
Y. and Bᴇngɪᴏ,
Y. (2004). Semi-supervised learning by entropy minimization.
Advances in neural information processing systems 17.
Guggᴇʀ, S., Dᴇbuᴛ, L., Wᴏʟf, T., Scʜᴍɪᴅ, P., Muᴇʟʟᴇʀ, Z., Mangʀuʟᴋᴀʀ, S., Sun, M. and Bᴏꜱꜱᴀn, B. (2022). Accelerate: Training and inference at scale made simple, efficient and adaptable.

Guʟʀᴀjanɪ,
I., Aʜᴍᴇᴅ,
F., Aʀjᴏvꜱᴋy,
M., Dumᴏuʟɪn,
V. and Cᴏuʀvɪʟʟᴇ,
A. C. (2017).
Improved training of wasserstein gans. Advances in neural information processing systems 30.
Hᴇndʀycᴋꜱ, D., Buʀnꜱ, C., Baꜱᴀʀᴛ, S., Zᴏu, A., Mazᴇɪᴋᴀ, M., Sᴏng, D. and Sᴛᴇɪnʜᴀʀᴅᴛ, J.
(2020). Measuring massive multitask language understanding. arXiv preprint arXiv:2009.03300 .
Hᴇʀnandᴇz-Lᴇᴀʟ, P., Kaʀᴛᴀʟ, B. and Tayʟᴏʀ, M. E. (2018). Is multiagent deep reinforcement learning the answer or the question? a brief survey. learning 21 22.
Hɪnᴛᴏn, G., Sʀɪvaꜱᴛᴀva, N. and Sᴡᴇʀꜱᴋy, K. (2012). Neural networks for machine learning lecture 6a overview of mini-batch gradient descent. Cited on 14 2.

Hᴏ,
J. and Eʀᴍᴏn,
S. (2016). Generative adversarial imitation learning. Advances in neural
information processing systems 29.
Jɪᴀng, A. Q., Sabʟᴀyʀᴏʟʟᴇꜱ, A., Mᴇnꜱᴄʜ, A., Bamfᴏʀᴅ, C., Cʜᴀᴘʟᴏᴛ, D. S., Caꜱᴀꜱ, D.
d. ʟ., Bʀᴇꜱꜱᴀnd, F., Lᴇngyᴇʟ, G., Lamᴘʟᴇ, G., Sauʟnɪᴇʀ, L. ᴇᴛ ᴀʟ. (2023). Mistral 7b.
arXiv preprint arXiv:2310.06825 .
Jᴏʟɪᴄᴏᴇuʀ-Maʀᴛɪnᴇᴀu, A. (2018). The relativistic discriminator: a key element missing from standard gan. arXiv preprint arXiv:1807.00734 .
Jᴏꜱɪfᴏꜱᴋɪ, M., Saᴋᴏᴛᴀ, M., Pᴇyʀᴀʀᴅ, M. and Wᴇꜱᴛ, R. (2023). Exploiting asymmetry for synthetic training data generation: Synthie and the case of information extraction. arXiv preprint arXiv:2303.04132 .
Kᴇᴀʀnꜱ, M. and Vaʟɪᴀnᴛ, L. (1994). Cryptographic limitations on learning boolean formulae and finite automata. Journal of the ACM (JACM) 41 67–95.

Kᴏu,
Y.,
Cʜᴇn,
Z., Caᴏ,
Y. and Gu, Q. (2022). How does semi-supervised learning with
pseudo-labelers work? a case study. In The Eleventh International Conference on Learning Representations.
Kumaʀ, M., Pacᴋᴇʀ, B. and Kᴏʟʟᴇʀ, D. (2010). Self-paced learning for latent variable models.
Advances in neural information processing systems 23.

24

Lancᴛᴏᴛ, M., Zambaʟᴅɪ, V., Gʀuꜱʟyꜱ, A., Lazaʀɪᴅᴏu, A., Tuyʟꜱ, K., Pᴇ́ʀᴏʟᴀᴛ, J., Sɪʟvᴇʀ,
D. and Gʀᴀᴇᴘᴇʟ, T. (2017). A unified game-theoretic approach to multiagent reinforcement learning. Advances in neural information processing systems 30.
Lᴇᴇ, D.-H. (2013). Pseudo-label: The simple and efficient semi-supervised learning method for deep neural networks. In ICML Challenges in Representation Learning Workshop.
Lᴇᴇ, Y. J. and Gʀᴀuman, K. (2011). Learning the easy things first: Self-paced visual category discovery. In CVPR 2011. IEEE.
Lᴇᴡᴋᴏᴡycz, A., Andʀᴇᴀꜱꜱᴇn, A., Dᴏʜᴀn, D., Dyᴇʀ, E., Mɪᴄʜᴀʟᴇᴡꜱᴋɪ, H., Ramaꜱᴇꜱʜ, V.,

Sʟᴏnᴇ,
A., Anɪʟ,
C., Scʜʟᴀc, I., Guᴛᴍᴀn-Sᴏʟᴏ,
T. ᴇᴛ ᴀʟ. (2022). Solving quantitative
reasoning problems with language models. Advances in Neural Information Processing Systems
35 3843–3857.

Lɪ,
Y.,
Bubᴇᴄᴋ,
S.,
Eʟᴅᴀn,
R.,
Gɪᴏʀnᴏ,
A. D.,
Gunaꜱᴇᴋᴀʀ,
S. and Lᴇᴇ,
Y. T. (2023).
Textbooks are all you need ii: phi-1.5 technical report.
Lɪ, Y., Cʜᴏɪ, D., Cʜunᴄ, J., Kuꜱʜᴍᴀn, N., Sᴄʜʀɪᴛᴛᴡɪᴇꜱᴇʀ, J., Lᴇbʟᴏnd, R., Eᴄᴄʟᴇꜱ, T., Kᴇᴇʟɪnᴄ, J., Gɪᴍᴇnᴏ, F., Daʟ Laᴄᴏ, A. ᴇᴛ ᴀʟ. (2022). Competition-level code generation with alphacode. Science 378 1092–1097.
Lɪn, S., Hɪʟᴛᴏn, J. and Evanꜱ, O. (2021). Truthfulqa: Measuring how models mimic human falsehoods. arXiv preprint arXiv:2109.07958 .
Lɪu, B., Bubᴇᴄᴋ, S., Eʟᴅᴀn, R., Kuʟᴋᴀʀnɪ, J., Lɪ, Y., Nᴄuyᴇn, A., Waʀᴅ, R. and Zʜᴀnᴄ,
Y. (2023). Tinygsm: achieving> 80% on gsm8k with small language models. arXiv preprint arXiv:2312.09241 .
Lɪu, C., Hᴇ, S., Lɪu, K., Zʜᴀᴏ, J. ᴇᴛ ᴀʟ. (2018). Curriculum learning for natural answer generation.
In IJCAI.
Lɪu, F., Gᴇ, S. and Wu, X. (2021). Competence-based multimodal curriculum learning for medical report generation. In Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics and the 11th International Joint Conference on Natural Language Processing (Volume 1: Long Papers).
Luᴏ, H., Sun, Q., Xu, C., Zʜᴀᴏ, P., Lᴏu, J., Taᴏ, C., Gᴇnᴄ, X., Lɪn, Q., Cʜᴇn, S. and Zʜᴀnᴄ, D. (2023). Wizardmath: Empowering mathematical reasoning for large language models via reinforced evol-instruct. arXiv preprint arXiv:2308.09583 .
Maᴏ, X., Lɪ, Q., Xɪᴇ, H., Lau, R. Y., Wanᴄ, Z. and Pauʟ Smᴏʟʟᴇy, S. (2017). Least squares generative adversarial networks. In Proceedings of the IEEE international conference on computer vision.
Mɪʜᴀyʟᴏv, T., Cʟᴀʀᴋ, P., Kʜᴏᴛ, T. and Sabʜᴀʀᴡᴀʟ, A. (2018). Can a suit of armor conduct electricity? a new dataset for open book question answering. In Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing.
Mɪꜱʜʀᴀ, S., Kʜᴀꜱʜᴀbɪ, D., Baʀᴀʟ, C. and Hajɪꜱʜɪʀzɪ, H. (2021). Cross-task generalization via natural language crowdsourcing instructions. arXiv preprint arXiv:2104.08773 .

25

Mʀᴏuᴇʜ, Y. and Sᴇʀᴄu, T. (2017). Fisher gan. Advances in neural information processing systems
30.
Müʟʟᴇʀ, A. (1997). Integral probability metrics and their generating classes of functions. Advances in applied probability 29 429–443.
Muʟʟᴇʀ, P., Omɪᴅꜱʜᴀfɪᴇɪ, S., Rᴏᴡʟᴀnd, M., Tuyʟꜱ, K., Pᴇʀᴏʟᴀᴛ, J., Lɪu, S., Hᴇnnᴇꜱ, D., Maʀʀɪꜱ, L., Lanᴄᴛᴏᴛ, M., Huᴄʜᴇꜱ, E. ᴇᴛ ᴀʟ. (2019). A generalized training approach for multiagent learning. arXiv preprint arXiv:1909.12823 .
OᴘᴇnAI (2023). Gpt-4 technical report.
Ouyanᴄ, L., Wu, J., Jɪᴀnᴄ, X., Aʟᴍᴇɪᴅᴀ, D., Waɪnᴡʀɪᴄʜᴛ, C., Mɪꜱʜᴋɪn, P., Zʜᴀnᴄ, C., Aᴄᴀʀᴡᴀʟ, S., Sʟᴀᴍᴀ, K., Ray, A. ᴇᴛ ᴀʟ. (2022). Training language models to follow instructions with human feedback. Advances in Neural Information Processing Systems 35 27730–27744.
Pʀᴀꜱᴀᴅ, A., Sᴛᴇnᴄᴇʟ-Eꜱᴋɪn, E. and Banꜱᴀʟ, M. (2023). Rephrase, augment, reason: Visual grounding of questions for vision-language models. arXiv preprint arXiv:2310.05861 .

Radfᴏʀᴅ,
A., Wu, J.,
Cʜɪʟᴅ,
R., Luan, D.,
Amᴏᴅᴇɪ,
D.,
Suᴛꜱᴋᴇvᴇʀ,
I. ᴇᴛ
ᴀʟ. (2019).
Language models are unsupervised multitask learners. OpenAI blog 1 9.
Rafaɪʟᴏv, R., Sʜᴀʀᴍᴀ, A., Mɪᴛᴄʜᴇʟʟ, E., Eʀᴍᴏn, S., Mannɪnᴄ, C. D. and Fɪnn, C. (2023). Direct preference optimization: Your language model is secretly a reward model. arXiv preprint arXiv:2305.18290 .
Rajbʜᴀndaʀɪ, S., Raꜱʟᴇy, J., Ruᴡᴀꜱᴇ, O. and Hᴇ, Y. (2020). Zero: Memory optimizations toward training trillion parameter models. In SC20: International Conference for High Performance Computing, Networking, Storage and Analysis. IEEE.
Rᴏxɪᴇʀᴇ, B., Gᴇʜʀɪnᴄ, J., Gʟᴏᴇᴄᴋʟᴇ, F., Sᴏᴏᴛʟᴀ, S., Gaᴛ, I., Tan, X. E., Adɪ, Y., Lɪu, J., Rᴇᴍᴇx, T., Raᴘɪn, J. ᴇᴛ ᴀʟ. (2023). Code llama: Open foundation models for code. arXiv preprint arXiv:2308.12950 .
Saᴋᴀᴄuᴄʜɪ, K., Bʀᴀꜱ, R. L., Bʜᴀᴄᴀvaᴛuʟᴀ, C. and Cʜᴏɪ, Y. (2021). Winogrande: An adversarial winograd schema challenge at scale. Communications of the ACM 64 99–106.
Samuᴇʟ, A. L. (1959). Some studies in machine learning using the game of checkers. IBM Journal of research and development 3 210–229.
Samuᴇʟ, A. L. (2000). Some studies in machine learning using the game of checkers. IBM Journal of research and development 44 206–226.
Sᴄʜᴀᴘɪʀᴇ, R. E. (1990). The strength of weak learnability. Machine learning 5 197–227.
Sɪʟvᴇʀ, D., Hubᴇʀᴛ, T., Sᴄʜʀɪᴛᴛᴡɪᴇꜱᴇʀ, J., Anᴛᴏnᴏᴄʟᴏu, I., Laɪ, M., Guᴇx, A., Lanᴄᴛᴏᴛ, M., Sɪfʀᴇ, L., Kumaʀᴀn, D., Gʀᴀᴇᴘᴇʟ, T. ᴇᴛ ᴀʟ. (2017a). Mastering chess and shogi by self-play with a general reinforcement learning algorithm. arXiv preprint arXiv:1712.01815 .

Sɪʟvᴇʀ,
D.,
Sᴄʜʀɪᴛᴛᴡɪᴇꜱᴇʀ,
J.,
Sɪᴍᴏnyan, K.,
Anᴛᴏnᴏᴄʟᴏu,
I.,
Huanᴄ,
A.,
Guᴇx,
A.,
Hubᴇʀᴛ, T., Baᴋᴇʀ, L., Laɪ, M., Bᴏʟᴛᴏn, A. ᴇᴛ ᴀʟ. (2017b). Mastering the game of go without human knowledge. nature 550 354–359.

26

Sɪnᴄʜ, A., Cᴏ-Rᴇyᴇꜱ, J. D., Aᴄᴀʀᴡᴀʟ, R., Anand, A., Paᴛɪʟ, P., Lɪu, P. J., Haʀʀɪꜱᴏn, J., Lᴇᴇ, J., Xu, K., Paʀɪꜱɪ, A. ᴇᴛ ᴀʟ. (2023). Beyond human data: Scaling self-training for problem-solving with language models. arXiv preprint arXiv:2312.06585 .
Sᴏvɪᴀny, P., Iᴏnᴇꜱᴄu, R. T., Rᴏᴛᴀ, P. and Sᴇbᴇ, N. (2022). Curriculum learning: A survey.
International Journal of Computer Vision 130 1526–1565.
Sᴘɪᴛᴋᴏvꜱᴋy, V. I., Aʟꜱʜᴀᴡɪ, H. and Juʀᴀfꜱᴋy, D. (2009). Baby steps: How “less is more” in unsupervised dependency parsing. In NIPS 2009 Workshop on Grammar Induction, Representation of Language and Language Learning.
Sᴛɪᴇnnᴏn, N., Ouyanᴄ, L., Wu, J., Zɪᴇᴄʟᴇʀ, D., Lᴏᴡᴇ, R., Vᴏꜱꜱ, C., Radfᴏʀᴅ, A., Amᴏᴅᴇɪ,
D. and Cʜʀɪꜱᴛɪᴀnᴏ, P. F. (2020). Learning to summarize with human feedback. Advances in Neural Information Processing Systems 33 3008–3021.

Taᴏʀɪ,
R., Guʟʀᴀjanɪ,
I., Zʜᴀnᴄ,
T., Dubᴏɪꜱ,
Y., Lɪ,
X., Guᴇꜱᴛʀɪn,
C., Lɪᴀnᴄ,
P. and
Haꜱʜɪᴍᴏᴛᴏ, T. B. (2023). Stanford alpaca: An instruction-following llama model.
Tᴇꜱᴀuʀᴏ, G. ᴇᴛ ᴀʟ. (1995). Temporal difference learning and td-gammon. Communications of the ACM 38 58–68.
Tʜᴏᴘᴘɪʟᴀn, R., Dᴇ Fʀᴇɪᴛᴀꜱ, D., Haʟʟ, J., Sʜᴀxᴇᴇʀ, N., Kuʟꜱʜʀᴇꜱʜᴛʜᴀ, A., Cʜᴇnᴄ, H.-T.,

Jɪn,
A., Bᴏꜱ,
T., Baᴋᴇʀ,
L., Du, Y. ᴇᴛ ᴀʟ. (2022). Lamda: Language models for dialog
applications. arXiv preprint arXiv:2201.08239 .
Tᴏuvʀᴏn, H., Maʀᴛɪn, L., Sᴛᴏnᴇ, K., Aʟbᴇʀᴛ, P., Aʟᴍᴀʜᴀɪʀɪ, A., Babaᴇɪ, Y., Baꜱʜʟyᴋᴏv, N., Baᴛʀᴀ, S., Bʜᴀʀᴄᴀva, P., Bʜᴏꜱᴀʟᴇ, S. ᴇᴛ ᴀʟ. (2023). Llama 2: Open foundation and fine-tuned chat models. arXiv preprint arXiv:2307.09288 .
Tunꜱᴛᴀʟʟ, L., Bᴇᴇᴄʜɪnᴄ, E., Lambᴇʀᴛ, N., Rajanɪ, N., Raꜱuʟ, K., Bᴇʟᴋᴀᴅᴀ, Y., Huanᴄ, S., vᴏn Wᴇʀʀᴀ, L., Fᴏuʀʀɪᴇʀ, C., Habɪb, N. ᴇᴛ ᴀʟ. (2023a). Zephyr: Direct distillation of lm alignment. arXiv preprint arXiv:2310.16944 .
Tunꜱᴛᴀʟʟ, L., Bᴇᴇᴄʜɪnᴄ, E., Lambᴇʀᴛ, N., Rajanɪ, N., Ruꜱʜ, A. M. and Wᴏʟf, T. (2023b).
The alignment handbook.
Vaᴘnɪᴋ, V. (1999). The nature of statistical learning theory. Springer science & business media.

Vɪᴄᴛᴏʀ,
S., Aʟbᴇʀᴛ,
W., Cᴏʟɪn,
R., Sᴛᴇᴘʜᴇn,
B., Lɪnᴛᴀnᴄ,
S., Zaɪᴅ,
A., Anᴛᴏɪnᴇ,
C.,

Aʀnaud, S.,
Aʀun, R., Manan, D. ᴇᴛ
ᴀʟ. (2022). Multitask prompted training enables
zero-shot task generalization. In International Conference on Learning Representations.
Vɪnyaʟꜱ, O., Babuꜱᴄʜᴋɪn, I., Cʜunᴄ, J., Maᴛʜɪᴇu, M., Jadᴇʀbᴇʀᴄ, M., Cxᴀʀnᴇᴄᴋɪ, W., Dudxɪᴋ, A., Huanᴄ, A., Gᴇᴏʀᴄɪᴇv, P., Pᴏᴡᴇʟʟ, R., Eᴡᴀʟᴅꜱ, T., Hᴏʀᴄᴀn, D., Kʀᴏɪꜱꜱ, M., Danɪʜᴇʟᴋᴀ, I., Aᴄᴀᴘɪᴏu, J., Oʜ, J., Daʟɪbaʀᴅ, V., Cʜᴏɪ, D., Sɪfʀᴇ, L., Suʟꜱᴋy, Y., Vᴇxʜnᴇvᴇᴛꜱ, S., Mᴏʟʟᴏy, J., Caɪ, T., Buddᴇn, D., Paɪnᴇ, T., Guʟᴄᴇʜʀᴇ, C., Wanᴄ, Z., Pfaff, T., Pᴏʜʟᴇn, T., Yᴏᴄᴀᴛᴀᴍᴀ, D., Cᴏʜᴇn, J., MᴄKɪnnᴇy, K., Smɪᴛʜ, O., Sᴄʜᴀuʟ, T., Lɪʟʟɪᴄʀᴀᴘ, T., Aᴘᴘꜱ, C., Kavuᴋᴄuᴏᴄʟu, K., Haꜱꜱᴀbɪꜱ, D. and Sɪʟvᴇʀ, D. (2019). AlphaStar: Mastering the Real-Time Strategy Game StarCraft II.


27

Wᴇɪ, J., Wanᴄ, X., Sᴄʜuuʀᴍᴀnꜱ, D., Bᴏꜱᴍᴀ, M., Xɪᴀ, F., Cʜɪ, E., Lᴇ, Q. V., Zʜᴏu, D. ᴇᴛ ᴀʟ. (2022). Chain-of-thought prompting elicits reasoning in large language models. Advances in Neural Information Processing Systems 35 24824–24837.
Wu, J., Lɪᴀnᴄ, Y., Aᴋbaʀɪ, H., Wanᴄ, Z., Yu, C. ᴇᴛ ᴀʟ. (2022). Scaling multimodal pre-training via cross-modality gradient harmonization. Advances in Neural Information Processing Systems 35 36161–36173.
Yanᴄ, Y., Sɪnᴄʜ, A. K., Eʟʜᴏuꜱʜɪ, M., Maʜᴍᴏud, A., Tɪʀumaʟᴀ, K., Gʟᴏᴇᴄᴋʟᴇ, F., Rᴏxɪᴇ̀ʀᴇ, B., Wu, C.-J., Mᴏʀᴄᴏꜱ, A. S. and Aʀᴅᴀʟᴀnɪ, N. (2023). Decoding data quality via synthetic corruptions: Embedding-guided pruning of code data. arXiv preprint arXiv:2312.02418 .
Yu, L., Jɪᴀnᴄ, W., Sʜɪ, H., Yu, J., Lɪu, Z., Zʜᴀnᴄ, Y., Kᴡᴏᴋ, J. T., Lɪ, Z., Wᴇʟʟᴇʀ, A. and Lɪu, W. (2023). Metamath: Bootstrap your own mathematical questions for large language models. arXiv preprint arXiv:2309.12284 .
Yuan, Z., Yuan, H., Lɪ, C., Dᴏnᴄ, G., Tan, C. and Zʜᴏu, C. (2023). Scaling relationship on learning mathematical reasoning with large language models. arXiv preprint arXiv:2308.01825 .
Zᴇʟʟᴇʀꜱ, R., Hᴏʟᴛxᴍᴀn, A., Bɪꜱᴋ, Y., Faʀʜᴀᴅɪ, A. and Cʜᴏɪ, Y. (2019). Hellaswag: Can a machine really finish your sentence? arXiv preprint arXiv:1905.07830 .
Zʜᴀnᴄ, D., Mᴇnᴄ, D., Lɪ, C., Jɪᴀnᴄ, L., Zʜᴀᴏ, Q. and Han, J. (2015). A self-paced multiple- instance learning framework for co-saliency detection. In Proceedings of the IEEE international conference on computer vision.
Zʜᴀnᴄ, X., Kumaʀ, G., Kʜᴀyʀᴀʟʟᴀʜ, H., Muʀʀᴀy, K., Gᴡɪnnuᴘ, J., Maʀᴛɪndaʟᴇ, M. J., MᴄNamᴇᴇ, P., Duʜ, K. and Caʀᴘuaᴛ, M. (2018). An empirical exploration of curriculum learning for neural machine translation. arXiv preprint arXiv:1811.00739 .
Zʜᴇnᴄ, L., Cʜɪᴀnᴄ, W.-L., Sʜᴇnᴄ, Y., Zʜuanᴄ, S., Wu, Z., Zʜuanᴄ, Y., Lɪn, Z., Lɪ, Z., Lɪ, D., Xɪnᴄ, E. ᴇᴛ ᴀʟ. (2023). Judging llm-as-a-judge with mt-bench and chatbot arena. arXiv preprint arXiv:2306.05685 .
Zɪᴇᴄʟᴇʀ, D. M., Sᴛɪᴇnnᴏn, N., Wu, J., Bʀᴏᴡn, T. B., Radfᴏʀᴅ, A., Amᴏᴅᴇɪ, D., Cʜʀɪꜱᴛɪᴀnᴏ,
P. and Iʀvɪnᴄ, G. (2019). Fine-tuning language models from human preferences. arXiv preprint arXiv:1909.08593 .
g











28


`;
