export const lorenIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In mollis massa a ante eleifend, at malesuada odio lobortis. Vivamus lobortis, nunc ut egestas rhoncus, est tortor dignissim est, nec congue nunc velit sed arcu. Sed sed accumsan risus. Etiam faucibus accumsan fermentum. In mattis interdum velit, ac tincidunt libero. Nunc suscipit dui nunc, vitae tempor orci euismod nec. Curabitur tristique quis lorem eu lobortis. Morbi odio lorem, porta id pretium commodo, vestibulum eu lacus. Mauris luctus sagittis augue, ac finibus orci auctor in. Pellentesque arcu tortor, vestibulum placerat sollicitudin vitae, accumsan nec magna. Cras molestie nisl tellus, vitae iaculis mi elementum vitae. Sed at malesuada dolor.

Aenean eget justo egestas, faucibus turpis eu, euismod est. In hac habitasse platea dictumst. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec blandit erat lacus, nec suscipit eros bibendum nec. Nullam vitae neque turpis. Praesent vel efficitur neque. Sed dignissim urna porttitor nisi cursus eleifend.

Vivamus ut ultricies sapien. Cras fringilla placerat maximus. Maecenas eget varius nulla, sed varius purus. Maecenas vestibulum, eros non faucibus eleifend, odio lacus vehicula lectus, vitae vestibulum dui tellus sollicitudin ex. Integer dapibus, justo at mollis porttitor, leo risus dapibus magna, vitae bibendum mi magna sed leo. Nam fringilla dolor ac massa pulvinar placerat. Nullam sit amet eleifend lectus. Maecenas eleifend nibh quis cursus convallis. Nam ut vehicula ante, vitae eleifend urna.

Nam pellentesque nulla vel risus cursus rutrum. Mauris blandit et orci non ultrices. Integer feugiat ex id neque faucibus, at fermentum dolor gravida. Proin metus nunc, eleifend nec pulvinar sit amet, faucibus vel metus. Sed rutrum ut erat id lacinia. Ut egestas sapien at ipsum gravida, dignissim aliquet nibh iaculis. Proin libero felis, condimentum ut eleifend non, euismod et odio. Curabitur auctor odio nec nisl vehicula, finibus dapibus nisi sodales. Phasellus cursus eget ligula a ultricies. Fusce eget erat risus.

Cras vitae aliquet est. Aliquam lorem libero, dignissim ut elit eget, aliquam ultrices magna. Quisque hendrerit leo ut sodales finibus. Praesent vestibulum risus at viverra euismod. Pellentesque lobortis turpis dictum mi condimentum, sed fringilla nisi sagittis. Fusce quis sodales libero. Phasellus nec hendrerit dolor. Aliquam sagittis euismod lorem, eget tincidunt mauris rutrum non. In luctus vitae tellus sed faucibus. Quisque in gravida massa, accumsan fermentum massa. Aliquam faucibus quis erat eget maximus. Vivamus molestie nulla nec facilisis tempor.`;

export const examplePaperUrl = "https://arxiv.org/pdf/2401.01335v2.pdf";

export const examplePaperText = `Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models
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

Oppon`;
